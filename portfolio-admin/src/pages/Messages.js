import React, { useEffect, useState } from 'react';
import { contactAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { Mail, MailOpen, Clock, Trash2, X, Loader2, Search, Send, Reply } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [search, setSearch] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    try {
      const response = await contactAPI.getAll();
      setMessages(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (msg) => {
    setSelectedMessage(msg);
    if (msg.status === 'unread') {
      try {
        await contactAPI.update(msg.id, { status: 'read' });
        fetchMessages();
      } catch (error) {}
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await contactAPI.update(id, { status });
      toast.success('Status updated');
      fetchMessages();
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, status });
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await contactAPI.delete(id);
      toast.success('Message deleted');
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }
    
    setSendingReply(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/contact/${selectedMessage.id}/reply`, 
        { replyMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Reply sent successfully!');
      setShowReplyForm(false);
      setReplyMessage('');
      fetchMessages();
      // Update selected message to show replied status
      setSelectedMessage({ ...selectedMessage, status: 'replied', reply_notes: replyMessage });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const filteredMessages = messages.filter(msg =>
    msg.name.toLowerCase().includes(search.toLowerCase()) ||
    msg.email.toLowerCase().includes(search.toLowerCase()) ||
    msg.subject?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div></div>;

  return (
    <div className="space-y-6 fade-in">
      <div><h1 className="text-2xl font-bold text-slate-800">Messages</h1><p className="text-slate-500">Manage contact form submissions</p></div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input type="text" placeholder="Search messages..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message list */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-soft border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-200"><h2 className="font-semibold text-slate-700">Inbox ({filteredMessages.length})</h2></div>
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filteredMessages.map((msg) => (
              <div key={msg.id} onClick={() => handleView(msg)}
                className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${selectedMessage?.id === msg.id ? 'bg-primary-50' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${msg.status === 'unread' ? 'text-primary-500' : 'text-slate-300'}`}>
                    {msg.status === 'unread' ? <Mail className="w-5 h-5" /> : <MailOpen className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium truncate ${msg.status === 'unread' ? 'text-slate-800' : 'text-slate-600'}`}>{msg.name}</p>
                      <span className="text-xs text-slate-400">{new Date(msg.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-500 truncate">{msg.email}</p>
                    <p className="text-sm text-slate-400 truncate">{msg.subject}</p>
                  </div>
                </div>
              </div>
            ))}
            {filteredMessages.length === 0 && <div className="p-8 text-center text-slate-500">No messages found</div>}
          </div>
        </div>

        {/* Message detail */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-soft border border-slate-100">
          {selectedMessage ? (
            <div>
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="font-semibold text-slate-800">Message Details</h2>
                <div className="flex items-center gap-2">
                  <select value={selectedMessage.status} onChange={(e) => handleStatusChange(selectedMessage.id, e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                  </select>
                  <button onClick={() => handleDelete(selectedMessage.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-slate-500">From</p><p className="font-medium text-slate-800">{selectedMessage.name}</p></div>
                  <div><p className="text-sm text-slate-500">Email</p><a href={`mailto:${selectedMessage.email}`} className="text-primary-600 hover:underline">{selectedMessage.email}</a></div>
                  <div><p className="text-sm text-slate-500">Subject</p><p className="text-slate-800">{selectedMessage.subject || 'No subject'}</p></div>
                  <div><p className="text-sm text-slate-500">Date</p><p className="text-slate-800">{new Date(selectedMessage.created_at).toLocaleString()}</p></div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-2">Message</p>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-slate-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
                {/* Reply Form */}
                {showReplyForm && (
                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-slate-800">Send Reply</h3>
                      <button onClick={() => { setShowReplyForm(false); setReplyMessage(''); }} className="p-1 hover:bg-slate-100 rounded">
                        <X className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply here..."
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => { setShowReplyForm(false); setReplyMessage(''); }}
                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReply}
                        disabled={sendingReply}
                        className="px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                      >
                        {sendingReply ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Reply</>}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Previous Reply */}
                {selectedMessage.reply_notes && (
                  <div className="border-t border-slate-200 pt-4">
                    <h3 className="font-medium text-slate-800 mb-2">Your Reply</h3>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-slate-700 whitespace-pre-wrap">{selectedMessage.reply_notes}</p>
                    </div>
                    {selectedMessage.replied_at && (
                      <p className="text-xs text-slate-400 mt-1">Replied on {new Date(selectedMessage.replied_at).toLocaleString()}</p>
                    )}
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReplyForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:opacity-90"
                  >
                    <Reply className="w-4 h-4" /> Send Reply
                  </button>
                  <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">
                    <Mail className="w-4 h-4" /> Open Email Client
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500">
              <Mail className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>Select a message to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;