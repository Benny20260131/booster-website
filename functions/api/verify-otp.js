export async function onRequestPost(context) {
  const { request } = context;
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const { token, otp } = await request.json();
    if (!token || !otp) {
      return new Response(JSON.stringify({ error: '参数缺失' }), { status: 400, headers });
    }

    let email, storedOtp, timestamp;
    try {
      const decoded = atob(token);
      [email, storedOtp, timestamp] = decoded.split(':');
    } catch {
      return new Response(JSON.stringify({ error: '验证码无效' }), { status: 400, headers });
    }

    // 10 分钟有效期
    if (Date.now() - Number(timestamp) > 10 * 60 * 1000) {
      return new Response(JSON.stringify({ error: '验证码已过期，请重新获取' }), { status: 400, headers });
    }

    if (otp.trim() !== storedOtp) {
      return new Response(JSON.stringify({ error: '验证码错误，请检查后重试' }), { status: 400, headers });
    }

    return new Response(JSON.stringify({ success: true, email }), { status: 200, headers });
  } catch (e) {
    console.error('Verify OTP error:', e);
    return new Response(JSON.stringify({ error: '服务器错误' }), { status: 500, headers });
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
