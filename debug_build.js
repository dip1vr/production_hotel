const { exec } = require('child_process');
const fs = require('fs');

exec('npm run build', (error, stdout, stderr) => {
    const output = `Error: ${error ? error.message : 'None'}\n\nStderr:\n${stderr}\n\nStdout:\n${stdout}`;
    fs.writeFileSync('debug_build_output.txt', output, 'utf8');
    console.log('Build finished, output saved to debug_build_output.txt');
});
