// Plays an MP3 file on the local machine with whatever player the OS has. Resolves when playback ends.
import { spawn } from 'node:child_process';

function run(cmd, args) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: 'ignore', windowsHide: true });
    child.on('error', () => resolve(false));
    child.on('close', (code) => resolve(code === 0));
  });
}

/** @param {string} file absolute path to an mp3 */
export async function playFile(file) {
  if (process.platform === 'darwin') return run('afplay', [file]);
  if (process.platform === 'win32') {
    // WPF MediaPlayer plays MP3 without extra installs; wait until the clip ends (max 30 s).
    const ps = `Add-Type -AssemblyName PresentationCore; $p = New-Object System.Windows.Media.MediaPlayer; $p.Open([uri]'${file.replace(/'/g, "''")}'); `
      + `$i = 0; while (-not $p.NaturalDuration.HasTimeSpan -and $i -lt 50) { Start-Sleep -Milliseconds 100; $i++ }; $p.Play(); `
      + `$ms = if ($p.NaturalDuration.HasTimeSpan) { [math]::Min($p.NaturalDuration.TimeSpan.TotalMilliseconds, 30000) } else { 5000 }; Start-Sleep -Milliseconds $ms; $p.Close()`;
    return run('powershell', ['-NoProfile', '-NonInteractive', '-Command', ps]);
  }
  for (const [cmd, args] of [['mpg123', ['-q']], ['ffplay', ['-nodisp', '-autoexit', '-loglevel', 'quiet']], ['paplay', []], ['play', ['-q']]]) {
    if (await run(cmd, [...args, file])) return true;
  }
  return false;
}
