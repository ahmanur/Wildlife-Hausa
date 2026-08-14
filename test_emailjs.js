async function test() {
  const serviceId = "service_q9frjor";
  const publicKey = "BmkB8_vOUBQyrfu7j";

  console.log("Testing EmailJS credentials...");
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: serviceId,
        user_id: publicKey,
        template_id: 'test_template', // dummy or default template ID
        template_params: {
          to_email: 'test@example.com',
          subject: 'Test Verification',
          message: 'This is a verification check.'
        }
      })
    });
    
    const text = await response.text();
    console.log(`Status Code: ${response.status}`);
    console.log(`Response Text: ${text}`);
  } catch (err) {
    console.error("Network error:", err);
  }
}

test();
