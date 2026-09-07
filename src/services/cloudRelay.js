import mqtt from 'mqtt';

const BROKERS = [
  'wss://broker.emqx.io:8084/mqtt',
  'wss://broker.hivemq.com:8884/mqtt'
];

class CloudRelayEngine {
  constructor() {
    this.client = null;
    this.connected = false;
    this.currentRoom = null;
    this.clientId = `ks_${Math.random().toString(36).substring(2, 10)}`;
    this.listeners = {
      onRoomState: null,
      onScoreToast: null,
      onGrandSummary: null,
      onWheelSpin: null
    };
    this.roomStateCache = null;
  }

  init() {
    if (this.client && this.connected) return;

    try {
      const brokerUrl = BROKERS[0];
      this.client = mqtt.connect(brokerUrl, {
        clientId: this.clientId,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 2000
      });

      this.client.on('connect', () => {
        console.log('[Cloud Relay] Connected to Zero-Config Cloud Realtime Engine');
        this.connected = true;
        if (this.currentRoom) {
          this.subscribeRoom(this.currentRoom);
        }
      });

      this.client.on('error', (err) => {
        console.warn('[Cloud Relay] Connection notice:', err.message);
      });

      this.client.on('message', (topic, payload) => {
        try {
          const msg = JSON.parse(payload.toString());
          this.handleIncomingMessage(msg);
        } catch (e) {
          console.error('[Cloud Relay] Error parsing message:', e);
        }
      });
    } catch (err) {
      console.error('[Cloud Relay] Init error:', err);
    }
  }

  isReady() {
    return this.connected;
  }

  subscribeRoom(roomId, callbacks = {}) {
    this.currentRoom = roomId.toUpperCase();
    this.listeners = { ...this.listeners, ...callbacks };

    if (!this.client || !this.connected) {
      this.init();
      return;
    }

    const topic = `krusauce/v1/rooms/${this.currentRoom}`;
    this.client.subscribe(topic, { qos: 1 }, (err) => {
      if (!err) {
        console.log(`[Cloud Relay] Subscribed to room topic: ${topic}`);
        // Request state sync from room leader/admin
        this.publish({ type: 'REQ_SYNC', roomId: this.currentRoom, sender: this.clientId });
      }
    });
  }

  publish(data) {
    if (!this.client || !this.connected || !this.currentRoom) return;
    const topic = `krusauce/v1/rooms/${this.currentRoom}`;
    const payload = JSON.stringify({ ...data, timestamp: Date.now() });
    this.client.publish(topic, payload, { qos: 1 });
  }

  handleIncomingMessage(msg) {
    if (!msg || !msg.type) return;

    // Ignore self messages for certain events if needed
    if (msg.type === 'SYNC_STATE' && msg.state) {
      this.roomStateCache = msg.state;
      if (this.listeners.onRoomState) {
        this.listeners.onRoomState(msg.state);
      }
    } else if (msg.type === 'SCORE_TOAST' && msg.toast) {
      if (this.listeners.onScoreToast) {
        this.listeners.onScoreToast(msg.toast);
      }
    } else if (msg.type === 'GRAND_SUMMARY' && msg.summary) {
      if (this.listeners.onGrandSummary) {
        this.listeners.onGrandSummary(msg.summary);
      }
    } else if (msg.type === 'WHEEL_SPIN' && msg.wheelData) {
      if (this.listeners.onWheelSpin) {
        this.listeners.onWheelSpin(msg.wheelData);
      }
    }
  }

  // Broadcast wheel spin to all screens
  broadcastWheelSpin(wheelData) {
    this.publish({
      type: 'WHEEL_SPIN',
      wheelData
    });
  }

  // Broadcast full updated state to all connected devices in the room
  broadcastState(state) {
    this.roomStateCache = state;
    this.publish({
      type: 'SYNC_STATE',
      state
    });
  }

  // Broadcast Score Toast celebration
  broadcastScoreToast(toast) {
    this.publish({
      type: 'SCORE_TOAST',
      toast
    });
  }

  // Broadcast Grand Summary
  broadcastGrandSummary(summary) {
    this.publish({
      type: 'GRAND_SUMMARY',
      summary
    });
  }
}

export const cloudRelay = new CloudRelayEngine();
