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
} from "lucide-react";

const Room = () => {
  const { roomId } = useParams();
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();

  const [roomDetails, setRoomDetails] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("video");
  const [remoteStreams, setRemoteStreams] = useState([]);

  const userVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({});

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data } = await API.get(`/rooms/${roomId}`);
        setRoomDetails(data);
      } catch (err) {
        console.error("Room error:", err);
      }
    };
    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    const iceServers = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" },
      ],
    };

    const createPeer = (targetSocketId, callerUsername, stream) => {
      const peer = new RTCPeerConnection(iceServers);
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("webrtc-signal", {
            targetSocketId,
            signal: { type: "candidate", candidate: event.candidate },
            callerId: user._id,
            username: user.username,
          });
        }
      };

      peer.ontrack = (event) => {
        setRemoteStreams((prev) => {
          if (prev.some((p) => p.socketId === targetSocketId)) return prev;
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

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }

        if (socket && user) {
          socket.emit("join-room", {
            roomId,
            userId: user._id,
            username: user.username,
          });

          socket.on("existing-users", (users) => {
            users.forEach(async (remoteUser) => {
              const peer = createPeer(
                remoteUser.socketId,
                remoteUser.username,
                stream,
              );
              peersRef.current[remoteUser.socketId] = peer;
              const offer = await peer.createOffer();
              await peer.setLocalDescription(offer);
              socket.emit("webrtc-signal", {
                targetSocketId: remoteUser.socketId,
                signal: { type: "offer", sdp: offer },
                callerId: user._id,
                username: user.username,
              });
            });
          });

          socket.on(
            "user-connected",
            ({ socketId, username: remoteUsername }) => {
              const peer = createPeer(socketId, remoteUsername, stream);
              peersRef.current[socketId] = peer;
            },
          );

          socket.on(
            "webrtc-signal",
            async ({
              signal,
              callerId: senderSocketId,
              username: remoteUsername,
            }) => {
              let peer = peersRef.current[senderSocketId];
              if (!peer) {
                peer = createPeer(senderSocketId, remoteUsername, stream);
                peersRef.current[senderSocketId] = peer;
              }

              if (signal.type === "offer") {
                await peer.setRemoteDescription(
                  new RTCSessionDescription(signal.sdp),
                );
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);
                socket.emit("webrtc-signal", {
                  targetSocketId: senderSocketId,
                  signal: { type: "answer", sdp: answer },
                  callerId: user._id,
                  username: user.username,
                });
              } else if (signal.type === "answer") {
                await peer.setRemoteDescription(
                  new RTCSessionDescription(signal.sdp),
                );
              } else if (signal.type === "candidate") {
                try {
                  await peer.addIceCandidate(
                    new RTCIceCandidate(signal.candidate),
                  );
                } catch (e) {
                  console.error("ICE error", e);
                }
              }
            },
          );

          socket.on("user-disconnected", (socketId) => {
            if (peersRef.current[socketId]) {
              peersRef.current[socketId].close();
              delete peersRef.current[socketId];
            }
            setRemoteStreams((prev) =>
              prev.filter((p) => p.socketId !== socketId),
            );
          });
        }
      })
      .catch((err) => console.error("Camera access error:", err));

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      Object.values(peersRef.current).forEach((peer) => peer.close());
      peersRef.current = {};
      if (socket) {
        socket.off("existing-users");
        socket.off("user-connected");
        socket.off("webrtc-signal");
        socket.off("user-disconnected");
      }
    };
  }, [socket, user, roomId]);

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

  return (
    <div className="h-[calc(100vh-73px)] bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="font-bold text-base text-white font-mono uppercase tracking-wider">
            {roomDetails?.roomName || "ACTIVE ROOM"}
          </h2>
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 mt-0.5">
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
            { id: "video", label: `Video Grid (${remoteStreams.length + 1})` },
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

      <div className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col items-center justify-center">
        {activeTab === "video" && (
          <div className="w-full h-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-4 my-auto overflow-y-auto p-2">
            <div className="relative bg-slate-900 border border-slate-800 aspect-video rounded-sm overflow-hidden flex items-center justify-center shadow-lg max-h-[420px] mx-auto w-full">
              <video
                ref={userVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 px-3 py-1 font-mono text-xs text-white rounded-sm flex items-center space-x-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block"></span>
                <span>{user?.username} (You)</span>
              </div>
            </div>

            {remoteStreams.length === 0 ? (
              <div className="relative bg-slate-900/40 border border-slate-800 aspect-video rounded-sm flex flex-col items-center justify-center p-6 text-center max-h-[420px] mx-auto w-full">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <p className="font-mono text-sm text-slate-300 font-bold uppercase tracking-wide">
                  Waiting for peers...
                </p>
                <p className="font-mono text-xs text-slate-500 mt-1">
                  Share Room ID with your team to initiate P2P mesh connection.
                </p>
              </div>
            ) : (
              remoteStreams.map((remote) => (
                <div
                  key={remote.socketId}
                  className="relative bg-slate-900 border border-slate-800 aspect-video rounded-sm overflow-hidden flex items-center justify-center shadow-lg max-h-[420px] mx-auto w-full"
                >
                  <video
                    ref={(ref) => {
                      if (ref) ref.srcObject = remote.stream;
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 px-3 py-1 font-mono text-xs text-white rounded-sm flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full inline-block animate-pulse"></span>
                    <span>{remote.username} (Peer)</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "whiteboard" && (
          <div className="w-full h-full max-w-6xl">
            <Whiteboard socket={socket} roomId={roomId} />
          </div>
        )}

        {activeTab === "chat" && (
          <div className="w-full h-full max-w-3xl">
            <ChatBox socket={socket} roomId={roomId} user={user} />
          </div>
        )}
      </div>

      <div className="bg-slate-900 border-t border-slate-800 px-6 py-3.5 flex items-center justify-center space-x-4 shrink-0">
        <button
          onClick={toggleMic}
          className={`p-3 rounded-sm border transition ${
            micOn
              ? "bg-slate-800 border-slate-700 text-white"
              : "bg-rose-500/20 border-rose-500/40 text-rose-400"
          }`}
          title={micOn ? "Mute Microphone" : "Unmute Microphone"}
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
          title={cameraOn ? "Turn Off Camera" : "Turn On Camera"}
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
