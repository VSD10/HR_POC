import json
import logging
from datetime import datetime, timezone
from typing import List
from fastapi import WebSocket

logger = logging.getLogger("hr_backend.ws")

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info("WebSocket connected. Total active: %d", len(self.active_connections))

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info("WebSocket disconnected. Total active: %d", len(self.active_connections))

    async def broadcast(self, event_name: str, payload: dict):
        message = {
            "event": event_name,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": payload
        }
        text_data = json.dumps(message)
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(text_data)
            except Exception as e:
                logger.warning("Error broadcasting to connection: %s", e)
                dead_connections.append(connection)

        for dead in dead_connections:
            self.disconnect(dead)

ws_manager = ConnectionManager()
