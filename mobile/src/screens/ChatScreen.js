import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  ActivityIndicator, SafeAreaView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C } from '../theme';
import { TopBar } from '../components';
import * as API from '../api';
import { useApp } from '../AppContext';
import * as Notifications from 'expo-notifications';

export default function ChatScreen({ navigation, route }) {
  const { visitId, doctorName } = route.params;
  const { state } = useApp();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const flatListRef = useRef();

  // Load history and check status
  useEffect(() => {
    loadChat();
    // Poll for new messages every 2 seconds for a "live" feel
    const iv = setInterval(loadChat, 2000);

    // Also refresh if a push notification arrives while in foreground
    const sub = Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data;
      if (data?.type === 'chat_message' && data?.visit_id === visitId) {
        loadChat();
      }
    });

    return () => {
      clearInterval(iv);
      sub.remove();
    };
  }, []);

  const loadChat = async () => {
    try {
      // 1. Get messages
      const msgs = await API.visits.getMessages(visitId);
      setMessages(msgs);

      // 2. Check visit status to see if chat should be locked
      const visit = await API.visits.get(visitId);
      if (['completed', 'cancelled'].includes(visit.status)) {
        setIsLocked(true);
      }
    } catch (err) {
      console.log('Load chat error', err);
    } finally {
      setLoading(false);
    }
  };

  const onSend = async () => {
    if (!text.trim() || sending || isLocked) return;
    const msgText = text.trim();
    setText('');
    setSending(true);

    try {
      const newMsg = await API.visits.sendMessage(visitId, msgText);
      setMessages(prev => [...prev, newMsg]);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    } catch (err) {
      console.log('Send message error', err);
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => {
    const isMe = item.sender_type === 'patient';
    return (
      <View style={[s.msgWrapper, isMe ? s.myMsgWrapper : s.theirMsgWrapper]}>
        <View style={[s.bubble, isMe ? s.myBubble : s.theirBubble]}>
          <Text style={[s.msgText, isMe ? s.myMsgText : s.theirMsgText]}>{item.text}</Text>
          <Text style={[s.timeText, isMe ? s.myTimeText : s.theirTimeText]}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading && messages.length === 0) {
    return (
      <View style={s.loader}>
        <ActivityIndicator size="large" color={C.blue} />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top', 'bottom']}>
      <TopBar 
        title={doctorName || 'Chat con Doctor'} 
        onBack={() => navigation.goBack()} 
      />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={s.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        {isLocked ? (
          <View style={s.lockedBanner}>
            <Feather name="lock" size={14} color={C.inkSoft} />
            <Text style={s.lockedText}>Esta consulta ha finalizado. El chat es de solo lectura.</Text>
          </View>
        ) : (
          <View style={s.inputArea}>
            <TextInput
              style={s.input}
              placeholder="Escribe un mensaje..."
              value={text}
              onChangeText={setText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[s.sendBtn, !text.trim() && { opacity: 0.5 }]} 
              onPress={onSend}
              disabled={!text.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, paddingBottom: 24 },
  msgWrapper: { marginBottom: 12, flexDirection: 'row' },
  myMsgWrapper: { justifyContent: 'flex-end' },
  theirMsgWrapper: { justifyContent: 'flex-start' },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    maxWidth: '80%',
    elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 },
  },
  myBubble: { backgroundColor: C.blue, borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
  msgText: { fontSize: 15, lineHeight: 20 },
  myMsgText: { color: '#fff' },
  theirMsgText: { color: C.ink },
  timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  myTimeText: { color: 'rgba(255,255,255,0.7)' },
  theirTimeText: { color: C.inkSoft },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F3F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 15,
    color: C.ink,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.blue,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#E9ECEF',
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  lockedText: {
    fontSize: 13,
    color: C.inkSoft,
    fontWeight: '600',
  },
});
