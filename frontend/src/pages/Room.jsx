import { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import API from "../api/axios";
import Whiteboard from "../components/Whiteboard";
import ChatBox from "../components/ChatBox";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Copy,
  Check,
  Users,
  AlertTriangle,
} from "lucide-react";

const Room = () => {
  const { roomId } = useParams();
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();

  const [roomDetails, setRoomDetails] = useState(null);
  const [roomError, setRoomError] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("video");
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [participants, setParticipants] = useState([]);

  const userVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({});

  const currentUsername =
    user?.username || `Peer-${Math.floor(Math.random() * 899 + 100)}`;
  const currentUserId =
    user?._id ||
    `guest-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data } = await API.get(`/rooms/${roomId}`);
        setRoomDetails(data);
      } catch (err) {
        setRoomError(true);
      }
    };
    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    if (roomError) return;

    const iceServers = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun.cloudflare.com:3478" },
        { urls: "stun:openrelay.metered.ca:80" },
      ],
    };

    const createPeer = (targetSocketId, callerUsername) => {
      const peer = new RTCPeerConnection(iceServers);
      peer.iceQueue = [];

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          peer.addTrack(track, localStreamRef.current);
        });
      } else {
        peer.addTransceiver("video", { direction: "recvonly" });
        peer.addTransceiver("audio", { direction: "recvonly" });
      }

      peer.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit("webrtc-signal", {
            targetSocketId,
            signal: { type: "candidate", candidate: event.candidate },
            callerId: currentUserId,
            username: currentUsername,
          });
        }
      };

      peer.ontrack = (event) => {
        setRemoteStreams((prev) => {
          const existing = prev.find((p) => p.socketId === targetSocketId);
          if (existing) {
            return prev.map((p) =>
              p.socketId === targetSocketId
                ? { ...p, stream: event.streams[0] }
                : p,
            );
          }
          return [
            ...prev,
            {
              socketId: targetSocketId,
              stream: event.streams[0],
              username: callerUsername || "Peer",
            },
          ];
        });
      };

      return peer;
    };

    const initSession = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn(
          "Media devices unaccessible, continuing in data-only mode:",
          err,
        );
      }

      if (!socket) return;

      const handleJoin = () => {
        socket.emit("join-room", {
          roomId,
          userId: currentUserId,
          username: currentUsername,
        });
      };

      if (socket.connected) {
        handleJoin();
      } else {
        socket.connect();
        socket.once("connect", handleJoin);
      }

      socket.on("room-users-update", (usersList) => {
        setParticipants(usersList.filter((u) => u.socketId !== socket.id));
      });

      socket.on("existing-users", (users) => {
        setParticipants(users);
        users.forEach(async (remoteUser) => {
          const peer = createPeer(remoteUser.socketId, remoteUser.username);
          peersRef.current[remoteUser.socketId] = peer;
          try {
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            socket.emit("webrtc-signal", {
              targetSocketId: remoteUser.socketId,
              signal: { type: "offer", sdp: offer },
              callerId: currentUserId,
              username: currentUsername,
            });
          } catch (e) {
            console.error("Offer error:", e);
          }
        });
      });

      socket.on("user-connected", ({ socketId, username: remoteUsername }) => {
        setParticipants((prev) => {
          if (prev.some((p) => p.socketId === socketId)) return prev;
          return [...prev, { socketId, username: remoteUsername }];
        });
        const peer = createPeer(socketId, remoteUsername);
        peersRef.current[socketId] = peer;
      });

      socket.on(
        "webrtc-signal",
        async ({
          signal,
          callerId: senderSocketId,
          username: remoteUsername,
        }) => {
          let peer = peersRef.current[senderSocketId];
          if (!peer) {
            peer = createPeer(senderSocketId, remoteUsername);
            peersRef.current[senderSocketId] = peer;
          }

          if (signal.type === "offer") {
            try {
              await peer.setRemoteDescription(
                new RTCSessionDescription(signal.sdp),
              );
              if (peer.iceQueue) {
                for (const candidate of peer.iceQueue) {
                  await peer.addIceCandidate(new RTCIceCandidate(candidate));
                }
                peer.iceQueue = [];
              }
              const answer = await peer.createAnswer();
              await peer.setLocalDescription(answer);
              socket.emit("webrtc-signal", {
                targetSocketId: senderSocketId,
                signal: { type: "answer", sdp: answer },
                callerId: currentUserId,
                username: currentUsername,
              });
            } catch (e) {
              console.error("Offer handle error:", e);
            }
          } else if (signal.type === "answer") {
            try {
              await peer.setRemoteDescription(
                new RTCSessionDescription(signal.sdp),
              );
              if (peer.iceQueue) {
                for (const candidate of peer.iceQueue) {
                  await peer.addIceCandidate(new RTCIceCandidate(candidate));
                }
                peer.iceQueue = [];
              }
            } catch (e) {
              console.error("Answer handle error:", e);
            }
          } else if (signal.type === "candidate") {
            try {
              if (peer.remoteDescription && peer.remoteDescription.type) {
                await peer.addIceCandidate(
                  new RTCIceCandidate(signal.candidate),
                );
              } else {
                peer.iceQueue = peer.iceQueue || [];
                peer.iceQueue.push(signal.candidate);
              }
            } catch (e) {
              console.error("ICE error:", e);
            }
          }
        },
      );

      socket.on("user-disconnected", (socketId) => {
        if (peersRef.current[socketId]) {
          peersRef.current[socketId].close();
          delete peersRef.current[socketId];
        }
        setRemoteStreams((prev) => prev.filter((p) => p.socketId !== socketId));
        setParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
      });
    };

    initSession();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      Object.values(peersRef.current).forEach((peer) => peer.close());
      peersRef.current = {};
      if (socket) {
        socket.off("room-users-update");
        socket.off("existing-users");
        socket.off("user-connected");
        socket.off("webrtc-signal");
        socket.off("user-disconnected");
      }
    };
  }, [socket, roomId, roomError]);

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicOn(audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraOn(videoTrack.enabled);
      }
    }
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveRoom = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    navigate("/");
  };

  if (roomError) {
    return (
      <div className="h-[calc(100vh-73px)] bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <AlertTriangle className="w-16 h-16 text-rose-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold font-mono tracking-tight">
          ACCESS DENIED // ROOM NOT FOUND
        </h2>
        <p className="text-slate-400 text-sm mt-2 max-w-md font-mono">
          The requested room ID does not exist in the active database registry.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 px-6 py-3 bg-white text-slate-950 font-mono font-bold text-xs uppercase tracking-widest rounded-sm"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const peersDisplayText =
    participants.length === 0
      ? `${currentUsername} (You)`
      : `${currentUsername} (You), ${participants.map((p) => p.username).join(", ")}`;

  return (
    <div className="h-[calc(100vh-73px)] bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="font-bold text-base text-white font-mono uppercase tracking-wider">
              {roomDetails?.roomName || "CONNECTING..."}
            </h2>
            <div className="hidden sm:flex items-center space-x-1.5 px-2 py-0.5 bg-slate-950 border border-slate-800 rounded-sm text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
              <span>
                PEERS ({participants.length + 1}): {peersDisplayText}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 mt-1">
            <span>
              ROOM ID: <strong className="text-blue-400">{roomId}</strong>
            </span>
            <button onClick={handleCopyRoomId} className="hover:text-white p-1">
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 p-1 rounded-sm">
          {[
            { id: "video", label: `Video Grid (${participants.length + 1})` },
            { id: "whiteboard", label: "Whiteboard" },
            { id: "chat", label: "Live Chat" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 font-mono text-xs uppercase tracking-wider rounded-sm transition ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sm:hidden bg-slate-950 border-b border-slate-800 px-4 py-2 font-mono text-[11px] text-emerald-400 flex items-center space-x-2">
        <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
        <span className="truncate">
          ONLINE ({participants.length + 1}): {peersDisplayText}
        </span>
      </div>

      <div className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col items-center justify-center">
        <div
          className={`w-full h-full max-w-6xl overflow-y-auto p-2 ${activeTab === "video" ? "block" : "hidden"}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full items-center">
            <div className="relative bg-slate-900 border border-slate-800 aspect-video rounded-sm overflow-hidden flex items-center justify-center shadow-lg max-h-[420px] mx-auto w-full">
              <video
                ref={userVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {!cameraOn && (
                <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-600/20 border border-emerald-500 flex items-center justify-center text-emerald-400 font-mono text-2xl font-bold mb-2 shadow-inner">
                    {currentUsername.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-mono text-slate-400 uppercase">
                    Camera Off
                  </span>
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 px-3 py-1 font-mono text-xs text-white rounded-sm flex items-center space-x-2 z-10">
                <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block"></span>
                <span>{currentUsername} (You)</span>
              </div>
            </div>

            {participants.length === 0 ? (
              <div className="relative bg-slate-900/40 border border-slate-800 aspect-video rounded-sm flex flex-col items-center justify-center p-6 text-center max-h-[420px] mx-auto w-full">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <p className="font-mono text-sm text-slate-300 font-bold uppercase tracking-wide">
                  Waiting for peers to join...
                </p>
                <p className="font-mono text-xs text-slate-500 mt-1">
                  Share Room ID with your team to initiate session.
                </p>
              </div>
            ) : (
              participants.map((participant) => {
                const peerStreamObj = remoteStreams.find(
                  (r) => r.socketId === participant.socketId,
                );
                const stream = peerStreamObj?.stream;

                return (
                  <div
                    key={participant.socketId}
                    className="relative bg-slate-900 border border-slate-800 aspect-video rounded-sm overflow-hidden flex items-center justify-center shadow-lg max-h-[420px] mx-auto w-full"
                  >
                    {stream ? (
                      <video
                        ref={(ref) => {
                          if (ref && ref.srcObject !== stream)
                            ref.srcObject = stream;
                        }}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : null}

                    {!stream && (
                      <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500 flex items-center justify-center text-blue-400 font-mono text-2xl font-bold mb-3 shadow-inner">
                          {participant.username
                            ? participant.username.charAt(0).toUpperCase()
                            : "?"}
                        </div>
                        <p className="font-mono text-sm text-slate-300 font-bold">
                          {participant.username}
                        </p>
                        <span className="mt-1 px-2 py-0.5 bg-slate-950 border border-slate-800 text-[10px] font-mono text-amber-400 rounded-sm animate-pulse">
                          Connecting Media / Cam Off
                        </span>
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 px-3 py-1 font-mono text-xs text-white rounded-sm flex items-center space-x-2 z-10">
                      <span
                        className={`w-2 h-2 rounded-full inline-block ${stream ? "bg-blue-500 animate-pulse" : "bg-amber-500"}`}
                      ></span>
                      <span>{participant.username} (Peer)</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div
          className={`w-full h-full max-w-6xl ${activeTab === "whiteboard" ? "block" : "hidden"}`}
        >
          <Whiteboard socket={socket} roomId={roomId} />
        </div>

        <div
          className={`w-full h-full max-w-3xl ${activeTab === "chat" ? "block" : "hidden"}`}
        >
          <ChatBox socket={socket} roomId={roomId} user={user} />
        </div>
      </div>

      <div className="bg-slate-900 border-t border-slate-800 px-6 py-3.5 flex items-center justify-center space-x-4 shrink-0">
        <button
          onClick={toggleMic}
          className={`p-3 rounded-sm border transition ${
            micOn
              ? "bg-slate-800 border-slate-700 text-white"
              : "bg-rose-500/20 border-rose-500/40 text-rose-400"
          }`}
        >
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleCamera}
          className={`p-3 rounded-sm border transition ${
            cameraOn
              ? "bg-slate-800 border-slate-700 text-white"
              : "bg-rose-500/20 border-rose-500/40 text-rose-400"
          }`}
        >
          {cameraOn ? (
            <VideoIcon className="w-5 h-5" />
          ) : (
            <VideoOff className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={handleLeaveRoom}
          className="px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-sm font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition"
        >
          <PhoneOff className="w-4 h-4" />
          <span>Terminate Call</span>
        </button>
      </div>
    </div>
  );
};

export default Room;
