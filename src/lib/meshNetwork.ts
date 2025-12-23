/**
 * Mesh Network Bridge
 * Provides peer-to-peer connectivity when cellular/wifi fails
 * Uses WebRTC Data Channels and Web Bluetooth as fallback layers
 */

interface PeerMessage {
    type: 'pounce' | 'beacon' | 'chat' | 'presence';
    senderId: string;
    senderName: string;
    payload: any;
    timestamp: number;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'mesh-only';

class MeshNetworkBridge {
    private peers: Map<string, RTCPeerConnection> = new Map();
    private dataChannels: Map<string, RTCDataChannel> = new Map();
    private userId: string | null = null;
    private userName: string = 'Anonymous';
    private onMessageCallback: ((message: PeerMessage) => void) | null = null;
    private status: ConnectionStatus = 'disconnected';

    /**
     * Initialize the mesh network with user credentials
     */
    async initialize(userId: string, userName: string): Promise<void> {
        this.userId = userId;
        this.userName = userName;

        // Check if WebRTC is available
        if (!('RTCPeerConnection' in window)) {
            console.warn('WebRTC not supported - mesh network unavailable');
            return;
        }

        this.status = 'connecting';
        console.log('Mesh Network Bridge initialized');
    }

    /**
     * Get current connection status
     */
    getStatus(): ConnectionStatus {
        return this.status;
    }

    /**
     * Check if we have any mesh peers
     */
    hasPeers(): boolean {
        return this.dataChannels.size > 0;
    }

    /**
     * Register a callback for incoming messages
     */
    onMessage(callback: (message: PeerMessage) => void): void {
        this.onMessageCallback = callback;
    }

    /**
     * Broadcast a message to all connected peers
     */
    broadcast(type: PeerMessage['type'], payload: any): void {
        if (!this.userId) return;

        const message: PeerMessage = {
            type,
            senderId: this.userId,
            senderName: this.userName,
            payload,
            timestamp: Date.now(),
        };

        const messageStr = JSON.stringify(message);

        this.dataChannels.forEach((channel, peerId) => {
            if (channel.readyState === 'open') {
                try {
                    channel.send(messageStr);
                } catch (error) {
                    console.error(`Failed to send to peer ${peerId}:`, error);
                }
            }
        });
    }

    /**
     * Send a direct message to a specific peer
     */
    sendTo(peerId: string, type: PeerMessage['type'], payload: any): boolean {
        if (!this.userId) return false;

        const channel = this.dataChannels.get(peerId);
        if (!channel || channel.readyState !== 'open') return false;

        const message: PeerMessage = {
            type,
            senderId: this.userId,
            senderName: this.userName,
            payload,
            timestamp: Date.now(),
        };

        try {
            channel.send(JSON.stringify(message));
            return true;
        } catch (error) {
            console.error(`Failed to send to peer ${peerId}:`, error);
            return false;
        }
    }

    /**
     * Connect to a peer using WebRTC
     */
    async connectToPeer(peerId: string, offer?: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit | null> {
        const config: RTCConfiguration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
            ],
        };

        const pc = new RTCPeerConnection(config);
        this.peers.set(peerId, pc);

        // Create data channel
        if (!offer) {
            const channel = pc.createDataChannel('mesh', { ordered: true });
            this.setupDataChannel(channel, peerId);
        }

        pc.ondatachannel = (event) => {
            this.setupDataChannel(event.channel, peerId);
        };

        pc.oniceconnectionstatechange = () => {
            if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
                this.disconnectFromPeer(peerId);
            }
        };

        if (offer) {
            await pc.setRemoteDescription(offer);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            return answer;
        } else {
            const newOffer = await pc.createOffer();
            await pc.setLocalDescription(newOffer);
            return newOffer;
        }
    }

    /**
     * Setup handlers for a data channel
     */
    private setupDataChannel(channel: RTCDataChannel, peerId: string): void {
        channel.onopen = () => {
            console.log(`Connected to peer: ${peerId}`);
            this.dataChannels.set(peerId, channel);
            this.status = this.status === 'disconnected' ? 'mesh-only' : 'connected';
        };

        channel.onclose = () => {
            console.log(`Disconnected from peer: ${peerId}`);
            this.dataChannels.delete(peerId);
            if (this.dataChannels.size === 0) {
                this.status = 'disconnected';
            }
        };

        channel.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data) as PeerMessage;
                this.onMessageCallback?.(message);
            } catch (error) {
                console.error('Failed to parse peer message:', error);
            }
        };
    }

    /**
     * Disconnect from a specific peer
     */
    disconnectFromPeer(peerId: string): void {
        const channel = this.dataChannels.get(peerId);
        if (channel) {
            channel.close();
            this.dataChannels.delete(peerId);
        }

        const pc = this.peers.get(peerId);
        if (pc) {
            pc.close();
            this.peers.delete(peerId);
        }
    }

    /**
     * Disconnect from all peers
     */
    disconnect(): void {
        this.dataChannels.forEach((_, peerId) => this.disconnectFromPeer(peerId));
        this.status = 'disconnected';
    }

    /**
     * Check if Bluetooth is available for fallback
     */
    async isBluetoothAvailable(): Promise<boolean> {
        if (!('bluetooth' in navigator)) return false;
        try {
            return await (navigator as any).bluetooth.getAvailability();
        } catch {
            return false;
        }
    }
}

// Export singleton instance
export const meshNetwork = new MeshNetworkBridge();
