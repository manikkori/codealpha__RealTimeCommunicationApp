import { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import API from "../api/axios";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Edit3,
  MessageSquare,
  Copy,
  Check,
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

  const userVideoRef = useRef(null);
  const localStreamRef = useRef(null);

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
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Camera access error:", err));

    if (socket && user) {
      socket.emit("join-room", {
        roomId,
        userId: user._id,
        username: user.username,
      });
    }

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
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
    <div className="min-h-[calc(100vh-73px)] bg-slate-950 text-slate-100 flex flex-col">
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-lg text-white font-mono">
            {roomDetails?.roomName || "ACTIVE ROOM"}
          </h2>
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
          <button
            onClick={() => setActiveTab("video")}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-sm transition ${
              activeTab === "video"
                ? "bg-blue-600 text-white font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Video Grid
          </button>
          <button
            onClick={() => setActiveTab("whiteboard")}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-sm transition ${
              activeTab === "whiteboard"
                ? "bg-blue-600 text-white font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Whiteboard
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        {activeTab === "video" ? (
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 my-auto">
            <div className="relative bg-slate-900 border border-slate-800 aspect-video rounded-sm overflow-hidden flex items-center justify-center">
              <video
                ref={userVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-slate-950/80 border border-slate-800 px-3 py-1 font-mono text-xs text-white rounded-sm">
                {user?.username} (You)
              </div>
            </div>

            <div className="relative bg-slate-900 border border-slate-800 aspect-video rounded-sm flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 font-mono text-lg mb-3">
                ?
              </div>
              <p className="font-mono text-sm text-slate-400">
                Waiting for peers to join...
              </p>
              <p className="font-mono text-xs text-slate-600 mt-1">
                Share Room ID: {roomId}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 p-8 text-center rounded-sm my-auto">
            <Edit3 className="w-10 h-10 text-blue-500 mx-auto mb-3" />
            <h3 className="font-mono font-bold text-lg text-white">
              Interactive Whiteboard
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Canvas drawing engine will connect in Step 4!
            </p>
          </div>
        )}
      </div>

      <div className="bg-slate-900 border-t border-slate-800 px-6 py-4 flex items-center justify-center space-x-4">
        <button
          onClick={toggleMic}
          className={`p-3.5 rounded-sm border transition ${
            micOn
              ? "bg-slate-800 border-slate-700 text-white"
              : "bg-rose-500/20 border-rose-500/40 text-rose-400"
          }`}
        >
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleCamera}
          className={`p-3.5 rounded-sm border transition ${
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
          className="p-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-sm font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition"
        >
          <PhoneOff className="w-5 h-5" />
          <span>Leave Call</span>
        </button>
      </div>
    </div>
  );
};

export default Room;
