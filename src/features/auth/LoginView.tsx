import React, { useState } from 'react';
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    const message = await login(username, password);
    if (message) setError(message);
    setSubmitting(false);
  };

  return (
    <main className="login-shell">
      <section className="login-intro">
        <span className="login-kicker"><ShieldCheck size={16} /> Khu vực nội bộ</span>
        <h1>Sổ Gốc<br />BKD TTNG.</h1>
        <p>Quản trị nguồn tiền, công nợ và phê duyệt vận hành trong một không gian được kiểm soát.</p>
        <div className="login-security-note"><LockKeyhole size={18} /> Phiên làm việc được xác thực từ máy chủ và tự hết hạn sau 12 giờ.</div>
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <div>
            <span className="login-overline">Đăng nhập hệ thống</span>
            <h2>Chào mừng trở lại</h2>
            <p>Dùng tài khoản do quản trị viên cấp để tiếp tục.</p>
          </div>
          <label>Tài khoản<input autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Tên đăng nhập" /></label>
          <label>Mật khẩu<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mật khẩu" /></label>
          {error && <div className="login-error" role="alert">{error}</div>}
          <button type="submit" className="login-submit" disabled={submitting}>{submitting ? 'Đang xác thực...' : <>Đăng nhập <ArrowRight size={17} /></>}</button>
        </form>
      </section>
    </main>
  );
};
