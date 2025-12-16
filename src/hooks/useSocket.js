"use client";

import { getCookieItem } from "@/utils/cookieUtils";
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export default function useSocket() {
    const socketRef = useRef(null);

    useEffect(() => {
        // Get token inside hook (NO need to pass from component)
        const token = typeof window !== "undefined"
            ? getCookieItem("current_user")?.token
            : null;

        if (!socketRef.current) {
            socketRef.current = io(
                process.env.NEXT_SOCKET_URL || "https://today-production-c074.up.railway.app",
                {
                    extraHeaders: {
                        Token: token,
                    },
                }
            );

            socketRef.current.connect();

            socketRef.current.on("connect", () => {
                console.log("🔗 Connected:", socketRef.current.id);
            });

            socketRef.current.on("disconnect", () => {
                console.log("❌ Disconnected");
            });

            socketRef.current.on("auth_error", (msg) => {
                console.log("🚫 Auth Error:", msg);
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    // Emit wrapper
    const emit = (event, data) => {
        socketRef.current?.emit(event, data);
    };

    // On wrapper
    const on = (event, callback) => {
        socketRef.current?.on(event, callback);
    };

    // Disconnect wrapper
    const disconnect = () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    };

    return {
        socket: socketRef.current,
        emit,
        on,
        disconnect,
    };
}
