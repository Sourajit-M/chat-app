const http = require('http');

const data = JSON.stringify({
  email: 'testuser@example.com',
  password: 'password123'
});

const loginOptions = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(loginOptions, (res) => {
  let body = '';
  const cookies = res.headers['set-cookie'];
  res.on('data', (chunk) => body += chunk.toString());
  res.on('end', () => {
    console.log(`Login Status: ${res.statusCode}`);
    if (res.statusCode !== 200) {
      console.log(`Login Error: ${body}`);
      return;
    }
    
    // Fetch users
    const usersOptions = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/conversations/users',
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    };
    
    const userReq = http.request(usersOptions, (userRes) => {
      let userBody = '';
      userRes.on('data', (chunk) => userBody += chunk.toString());
      userRes.on('end', () => {
        const users = JSON.parse(userBody);
        console.log(`Found ${users.length} users`);
        
        if (users.length < 2) {
            console.log("Not enough users to create a group (need 2 other members)");
            return;
        }

        const memberIds = users.slice(0, 2).map(u => u.id);
        const groupData = JSON.stringify({
          name: 'Test Group',
          memberIds
        });

        const groupOptions = {
          hostname: 'localhost',
          port: 5001,
          path: '/api/conversations/group',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(groupData),
            'Cookie': cookies
          }
        };

        const groupReq = http.request(groupOptions, (groupRes) => {
          let groupBody = '';
          groupRes.on('data', (chunk) => groupBody += chunk.toString());
          groupRes.on('end', () => {
            console.log(`Create Group Status: ${groupRes.statusCode}`);
            console.log(`Group Response: ${groupBody}`);
          });
        });
        groupReq.write(groupData);
        groupReq.end();
      });
    });
    userReq.end();
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
