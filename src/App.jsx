import React, { useState, useEffect } from 'react';
import { SocketProvider, useSocket } from './context/SocketContext';
import { PortalGate } from './pages/Auth/PortalGate';
import { TeacherWorkspace } from './pages/TeacherPanel/TeacherWorkspace';
import { StudentPortalPage } from './pages/StudentPortal/StudentPortalPage';
import { SubjectStore } from './services/subjectStore';
import { AdminDashboard } from './pages/AdminPanel/AdminDashboard';
import { JoinRoom } from './pages/StudentPanel/JoinRoom';
import { StudentDashboard } from './pages/StudentPanel/StudentDashboard';

const MainApp = () => {
  const { currentGroup, setCurrentGroup } = useSocket();
  const [role, setRole] = useState(null); // null | 'admin' | 'student'
  const [roomId, setRoomId] = useState('');

  // Authentication session: null | { role: 'teacher' } | { role: 'student', student: {...} }
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kru_sauce_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const handleSetUser = (user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('kru_sauce_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('kru_sauce_user');
    }
  };

  // Subject Store Reactive State
  const [subjects, setSubjects] = useState(() => SubjectStore.getSubjects());
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);



  // Sync / load initial subjects from server if available
  useEffect(() => {
    fetch('/api/subjects')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.data && Object.keys(data.data).length > 0) {
          SubjectStore.saveSubjects(data.data);
          setSubjects(data.data);
        }
      })
      .catch(() => {
        // LocalStorage fallback already active
      });
  }, []);

  // Check URL parameters for direct link / QR entry / subject deep link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join') || params.get('room');
    const roleParam = params.get('role');
    const subjParam = params.get('subject');

    if (joinCode) {
      setRoomId(joinCode.toUpperCase());
      if (roleParam === 'admin') {
        setRole('admin');
      } else {
        setRole('student');
      }
    } else if (subjParam) {
      setSelectedSubjectId(subjParam);
    }
  }, []);

  const handleSelectSubject = (subj) => {
    if (!subj) {
      setSelectedSubjectId(null);
      return;
    }
    const id = typeof subj === 'object' ? subj.id : subj;
    setSelectedSubjectId(id);
    const url = new URL(window.location.href);
    url.searchParams.set('subject', id);
    window.history.replaceState({}, document.title, url.toString());
  };

  const handleLogout = () => {
    handleSetUser(null);
    setSelectedSubjectId(null);
    setRole(null);
    setRoomId('');
    setCurrentGroup(null);
    const url = new URL(window.location.href);
    url.search = '';
    window.history.replaceState({}, document.title, url.pathname);
  };

  const handleCreateSubject = (data) => {
    const newSubj = SubjectStore.createSubject(data);
    const all = SubjectStore.getSubjects();
    setSubjects({ ...all });
    setSelectedSubjectId(newSubj.id);

    fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSubj)
    }).catch(() => {});
  };

  const handleDeleteSubject = (subjId) => {
    SubjectStore.deleteSubject(subjId);
    const all = SubjectStore.getSubjects();
    setSubjects({ ...all });
    if (selectedSubjectId === subjId) {
      setSelectedSubjectId(null);
    }

    fetch(`/api/subjects/${subjId}`, {
      method: 'DELETE'
    }).catch(() => {});
  };

  const handleSaveSubject = (updated) => {
    SubjectStore.saveSubject(updated);
    setSubjects(prev => ({
      ...prev,
      [updated.id]: updated
    }));

    fetch(`/api/subjects/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    }).catch(() => {});
  };

  const handleResetMock = () => {
    const mock = SubjectStore.resetToMockData();
    setSubjects(mock);
    fetch('/api/subjects/reset', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.data) {
          setSubjects(data.data);
        }
      })
      .catch(() => {});
  };

  const handleSelectRole = (selectedRole, pin) => {
    setRole(selectedRole);
    setRoomId(pin.toUpperCase());
  };

  const handleStudentJoined = (group, pin) => {
    setCurrentGroup(group);
    setRoomId(pin);
  };

  // 1. In-Room Admin Panel (Activity Mode)
  if (role === 'admin' && roomId) {
    return (
      <AdminDashboard
        roomId={roomId}
        onBack={handleLogout}
      />
    );
  }

  // 2. In-Room Student Panel (Activity Mode)
  if (role === 'student' && roomId) {
    if (!currentGroup) {
      return (
        <JoinRoom
          initialRoomId={roomId}
          onJoined={handleStudentJoined}
        />
      );
    }
    return (
      <StudentDashboard
        roomId={roomId}
        onLeave={() => {
          setCurrentGroup(null);
          setRoomId('');
          setRole(null);
        }}
      />
    );
  }

  // 3. Teacher Portal Workspace (Collapsible Sidebar & Modules)
  if (currentUser && currentUser.role === 'teacher') {
    return (
      <TeacherWorkspace
        subjects={subjects}
        selectedSubjectId={selectedSubjectId}
        onSelectSubject={handleSelectSubject}
        onSaveSubject={handleSaveSubject}
        onCreateSubject={handleCreateSubject}
        onDeleteSubject={handleDeleteSubject}
        onResetMock={handleResetMock}
        onLogout={handleLogout}
      />
    );
  }

  // 4. Student Portal Page (Personalized Student Dashboard)
  if (currentUser && currentUser.role === 'student' && currentUser.student) {
    return (
      <StudentPortalPage
        student={currentUser.student}
        subjects={subjects}
        onLogout={handleLogout}
        onJoinRoom={(pin) => {
          setRoomId(pin);
          setRole('student');
        }}
      />
    );
  }

  // 5. Landing / Portal Gate: Single universal passcode input & Student ID search modal
  return (
    <PortalGate
      subjects={subjects}
      onLoginTeacher={() => handleSetUser({ role: 'teacher' })}
      onLoginStudent={(std) => handleSetUser({ role: 'student', student: std })}
    />
  );

};

export default function App() {
  return (
    <SocketProvider>
      <MainApp />
    </SocketProvider>
  );
}

