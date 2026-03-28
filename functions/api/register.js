export async function onRequestPost(context) {
  const { request, env } = context;
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const body = await request.json();
    const { name, email, phone, company, position } = body;

    if (!name || !email || !phone || !company) {
      return new Response(JSON.stringify({ error: '姓名、邮箱、手机号、公司名称为必填项' }), { status: 400, headers });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: '邮箱格式不正确' }), { status: 400, headers });
    }

    const apiKey = env.RESEND_API_KEY;
    if (apiKey) {
      // 欢迎邮件 → 用户
      const welcomeHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
  <div style="background: linear-gradient(135deg,#9B0023,#C8102E); padding: 32px 40px; border-radius: 12px 12px 0 0;">
    <h1 style="color:#fff; margin:0; font-size:24px; font-weight:800;">欢迎加入博仕达生物！</h1>
    <p style="color:rgba(255,255,255,0.85); margin:8px 0 0; font-size:14px;">感谢您注册上海博仕达生物工程有限公司</p>
  </div>
  <div style="padding: 32px 40px; border: 1px solid #f0f0f0; border-top: none; border-radius: 0 0 12px 12px;">
    <p style="font-size:16px; color:#333;">亲爱的 <strong style="color:#C8102E;">${name}</strong>，您好！</p>
    <p style="color:#555; line-height:1.8;">您的注册已成功，以下是您的账号信息：</p>
    <table style="width:100%; border-collapse:collapse; margin:16px 0;">
      <tr><td style="padding:10px; background:#FFF5F7; font-weight:600; color:#C8102E; width:120px; border-radius:4px;">姓名</td><td style="padding:10px; color:#333;">${name}</td></tr>
      <tr><td style="padding:10px; background:#FFF5F7; font-weight:600; color:#C8102E; border-radius:4px;">邮箱</td><td style="padding:10px; color:#333;">${email}</td></tr>
      <tr><td style="padding:10px; background:#FFF5F7; font-weight:600; color:#C8102E; border-radius:4px;">手机号</td><td style="padding:10px; color:#333;">${phone}</td></tr>
      <tr><td style="padding:10px; background:#FFF5F7; font-weight:600; color:#C8102E; border-radius:4px;">公司</td><td style="padding:10px; color:#333;">${company}</td></tr>
      ${position ? `<tr><td style="padding:10px; background:#FFF5F7; font-weight:600; color:#C8102E; border-radius:4px;">职位</td><td style="padding:10px; color:#333;">${position}</td></tr>` : ''}
    </table>
    <p style="color:#555; line-height:1.8;">我们的专业团队将为您提供一流的产品和服务。如有任何问题，请随时联系我们。</p>
    <div style="margin-top:24px; padding:16px; background:#FFF5F7; border-left:4px solid #C8102E; border-radius:4px;">
      <p style="margin:0; color:#C8102E; font-weight:600;">联系方式</p>
      <p style="margin:4px 0 0; color:#555; font-size:14px;">邮箱：service@tflabservice.com</p>
    </div>
    <p style="color:#999; font-size:12px; margin-top:24px;">此邮件由上海博仕达生物工程有限公司官网自动发送</p>
  </div>
</div>`;

      // 管理员通知
      const adminHtml = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #C8102E; border-bottom: 2px solid #C8102E; padding-bottom: 10px;">新用户注册 — 博仕达官网</h2>
  <table style="width: 100%; border-collapse: collapse;">
    <tr><td style="padding:10px; background:#f9f9f9; font-weight:bold; width:120px;">姓名</td><td style="padding:10px; border-left:3px solid #C8102E;">${name}</td></tr>
    <tr><td style="padding:10px; background:#f9f9f9; font-weight:bold;">邮箱</td><td style="padding:10px; border-left:3px solid #C8102E;">${email}</td></tr>
    <tr><td style="padding:10px; background:#f9f9f9; font-weight:bold;">手机号</td><td style="padding:10px; border-left:3px solid #C8102E;">${phone}</td></tr>
    <tr><td style="padding:10px; background:#f9f9f9; font-weight:bold;">公司名称</td><td style="padding:10px; border-left:3px solid #C8102E;">${company}</td></tr>
    <tr><td style="padding:10px; background:#f9f9f9; font-weight:bold;">职位</td><td style="padding:10px; border-left:3px solid #C8102E;">${position || '未填写'}</td></tr>
    <tr><td style="padding:10px; background:#f9f9f9; font-weight:bold;">注册时间</td><td style="padding:10px; border-left:3px solid #C8102E;">${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</td></tr>
  </table>
</div>`;

      await Promise.all([
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: '博仕达生物 <service@tflabservice.com>',
            to: [email],
            subject: '欢迎注册博仕达生物 — 注册成功确认',
            html: welcomeHtml,
          }),
        }),
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: '博仕达官网 <service@tflabservice.com>',
            to: ['service@tflabservice.com'],
            subject: `【新用户注册】${name} - ${company}`,
            html: adminHtml,
          }),
        }),
      ]);
    }

    return new Response(JSON.stringify({ success: true, user: { name, email, phone, company, position: position || '' } }), { status: 200, headers });
  } catch (e) {
    console.error('Register error:', e);
    return new Response(JSON.stringify({ error: '服务器错误，请稍后重试' }), { status: 500, headers });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
