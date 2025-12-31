import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Agora RTC Token Generator
// Based on Agora's token generation algorithm

const VERSION = "007";
const VERSION_LENGTH = 3;

const Privileges = {
  kJoinChannel: 1,
  kPublishAudioStream: 2,
  kPublishVideoStream: 3,
  kPublishDataStream: 4,
};

function getTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

function randomInt(): number {
  return Math.floor(Math.random() * 0xFFFFFFFF);
}

async function hmacSha256(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const keyBuffer = key.buffer.slice(key.byteOffset, key.byteOffset + key.byteLength) as ArrayBuffer;
  const messageBuffer = message.buffer.slice(message.byteOffset, message.byteOffset + message.byteLength) as ArrayBuffer;
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageBuffer);
  return new Uint8Array(signature);
}

function encodeUint16(value: number): Uint8Array {
  const buffer = new ArrayBuffer(2);
  const view = new DataView(buffer);
  view.setUint16(0, value, true); // little endian
  return new Uint8Array(buffer);
}

function encodeUint32(value: number): Uint8Array {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setUint32(0, value, true); // little endian
  return new Uint8Array(buffer);
}

function encodeString(str: string): Uint8Array {
  const encoder = new TextEncoder();
  const strBytes = encoder.encode(str);
  const lenBytes = encodeUint16(strBytes.length);
  const result = new Uint8Array(lenBytes.length + strBytes.length);
  result.set(lenBytes, 0);
  result.set(strBytes, lenBytes.length);
  return result;
}

function encodeMapUint32(map: Map<number, number>): Uint8Array {
  const parts: Uint8Array[] = [];
  parts.push(encodeUint16(map.size));
  
  map.forEach((value, key) => {
    parts.push(encodeUint16(key));
    parts.push(encodeUint32(value));
  });
  
  const totalLength = parts.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

function base64Encode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function generateAccessToken(
  appId: string,
  appCertificate: string,
  channelName: string,
  uid: string,
  role: number,
  privilegeExpiredTs: number
): Promise<string> {
  const encoder = new TextEncoder();
  
  // Create message
  const salt = randomInt();
  const ts = getTimestamp();
  const uidStr = uid || "0";
  
  // Build privilege map
  const privileges = new Map<number, number>();
  privileges.set(Privileges.kJoinChannel, privilegeExpiredTs);
  if (role === 1) { // Publisher
    privileges.set(Privileges.kPublishAudioStream, privilegeExpiredTs);
    privileges.set(Privileges.kPublishVideoStream, privilegeExpiredTs);
    privileges.set(Privileges.kPublishDataStream, privilegeExpiredTs);
  }
  
  // Pack message
  const messageParts: Uint8Array[] = [];
  messageParts.push(encodeUint32(salt));
  messageParts.push(encodeUint32(ts));
  messageParts.push(encodeMapUint32(privileges));
  
  const messageLength = messageParts.reduce((sum, arr) => sum + arr.length, 0);
  const message = new Uint8Array(messageLength);
  let offset = 0;
  for (const part of messageParts) {
    message.set(part, offset);
    offset += part.length;
  }
  
  // Generate signature
  const signContent = new Uint8Array([
    ...encoder.encode(appId),
    ...encoder.encode(channelName),
    ...encoder.encode(uidStr),
    ...message
  ]);
  
  const signature = await hmacSha256(encoder.encode(appCertificate), signContent);
  
  // Pack content
  const contentParts: Uint8Array[] = [];
  contentParts.push(encodeString(signature.reduce((str, byte) => str + String.fromCharCode(byte), '')));
  contentParts.push(encodeUint32(0)); // crc_channel_name placeholder
  contentParts.push(encodeUint32(0)); // crc_uid placeholder
  contentParts.push(encodeString(message.reduce((str, byte) => str + String.fromCharCode(byte), '')));
  
  const contentLength = contentParts.reduce((sum, arr) => sum + arr.length, 0);
  const content = new Uint8Array(contentLength);
  offset = 0;
  for (const part of contentParts) {
    content.set(part, offset);
    offset += part.length;
  }
  
  // Final token
  const token = VERSION + appId + base64Encode(content);
  
  return token;
}

// Simplified RTC Token Builder using Agora's algorithm
async function buildTokenWithUid(
  appId: string,
  appCertificate: string,
  channelName: string,
  uid: number | string,
  role: number,
  tokenExpireSeconds: number
): Promise<string> {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + tokenExpireSeconds;
  
  const uidStr = typeof uid === 'number' ? uid.toString() : uid;
  
  return await generateAccessToken(
    appId,
    appCertificate,
    channelName,
    uidStr,
    role,
    privilegeExpiredTs
  );
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const AGORA_APP_ID = Deno.env.get('AGORA_APP_ID');
    const AGORA_APP_CERTIFICATE = Deno.env.get('AGORA_APP_CERTIFICATE');

    if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
      console.error('Missing Agora credentials');
      throw new Error('Agora credentials not configured');
    }

    const { channelName, uid, role = 1 } = await req.json();

    if (!channelName) {
      throw new Error('Channel name is required');
    }

    console.log(`Generating token for channel: ${channelName}, uid: ${uid}, role: ${role}`);

    // Token expires in 24 hours
    const tokenExpireSeconds = 86400;
    
    const token = await buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      uid || 0,
      role,
      tokenExpireSeconds
    );

    console.log('Token generated successfully');

    return new Response(
      JSON.stringify({
        token,
        appId: AGORA_APP_ID,
        channel: channelName,
        uid: uid || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Error generating Agora token:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
