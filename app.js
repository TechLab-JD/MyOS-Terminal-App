// MyOS Terminal — a tiny in-browser command line. Pure static, no backend.
// Commands are safe and local: no file system, no network, no eval of code.
(function () {
  var out = document.getElementById('tm-out');
  var input = document.getElementById('tm-in');
  var root = document.getElementById('tm-root');
  if (!out || !input) return;

  var HKEY = 'myos.terminal.history';
  var hist = [];
  try { hist = JSON.parse(localStorage.getItem(HKEY)) || []; } catch (e) {}
  var hi = hist.length;

  var APPS = ['Notepad', 'Calculator', 'Tasks', 'Clock', 'Paint', '2048', 'Files',
    'Sticky Notes', 'Music', 'Weather', 'Markdown', 'Color Picker', 'Calendar',
    'Unit Converter', 'Snake', 'Minesweeper', 'JSON Tools', 'Dictionary',
    'Habit Tracker', 'Kanban', 'Pomodoro', 'Flashcards', 'Terminal'];

  function esc(s) {
    return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; });
  }
  function print(text, cls) {
    var d = document.createElement('div');
    d.className = 'l' + (cls ? ' ' + cls : '');
    d.innerHTML = text;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
  }
  function echoCmd(cmd) {
    print('<span class="cmd"><span class="p">myos $</span> ' + esc(cmd) + '</span>');
  }

  var CMDS = {
    help: function () {
      return 'Available commands:\n' +
        '  help            this list\n' +
        '  echo <text>     print text\n' +
        '  calc <expr>     evaluate a math expression (e.g. calc 3*(4+5))\n' +
        '  apps            list the MyOS apps\n' +
        '  date            current date and time\n' +
        '  whoami          current user\n' +
        '  history         show command history\n' +
        '  clear           clear the screen\n' +
        '  about           about this terminal';
    },
    echo: function (a) { return esc(a); },
    date: function () { return new Date().toString(); },
    whoami: function () { return 'guest@myos'; },
    apps: function () { return APPS.map(function (n) { return '  ' + n; }).join('\n'); },
    ls: function () { return CMDS.apps(); },
    dir: function () { return CMDS.apps(); },
    about: function () {
      return 'MyOS Terminal — a tiny, safe, local command line.\n' +
        'Part of MyOS: https://github.com/TechLab-JD/MyOS\n' +
        'No backend, no network, no real file system — everything runs in your browser.';
    },
    history: function () {
      return hist.length ? hist.map(function (h, i) { return '  ' + (i + 1) + '  ' + esc(h); }).join('\n') : '(no history yet)';
    },
    calc: function (a) {
      var expr = (a || '').trim();
      if (!expr) return { err: 'usage: calc <expression>' };
      if (!/^[-+*/%.()\d\s]+$/.test(expr)) return { err: 'calc only accepts numbers and + - * / % ( )' };
      try {
        // eslint-disable-next-line no-new-func
        var val = Function('"use strict";return (' + expr + ')')();
        if (typeof val !== 'number' || !isFinite(val)) return { err: 'not a finite number' };
        return String(val);
      } catch (e) { return { err: 'could not evaluate that' }; }
    }
  };

  function run(raw) {
    var line = raw.trim();
    echoCmd(raw);
    if (line) {
      hist.push(line);
      if (hist.length > 200) hist = hist.slice(-200);
      try { localStorage.setItem(HKEY, JSON.stringify(hist)); } catch (e) {}
      hi = hist.length;
      if (line === 'clear' || line === 'cls') { out.innerHTML = ''; return; }
      var sp = line.indexOf(' ');
      var name = (sp < 0 ? line : line.slice(0, sp)).toLowerCase();
      var arg = sp < 0 ? '' : line.slice(sp + 1);
      var fn = CMDS[name];
      if (!fn) { print('command not found: ' + esc(name) + ' — type <b>help</b>', 'err'); return; }
      var res = fn(arg);
      if (res && typeof res === 'object' && res.err) print(res.err, 'err');
      else if (res != null && res !== '') print(res);
    }
  }

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var v = input.value; input.value = '';
      run(v);
    } else if (e.key === 'ArrowUp') {
      if (hi > 0) { hi--; input.value = hist[hi] || ''; }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (hi < hist.length) { hi++; input.value = hist[hi] || ''; }
      e.preventDefault();
    }
  });
  root.addEventListener('click', function () { input.focus(); });

  print('MyOS Terminal — type <b>help</b> to get started.', 'dim');
  input.focus();
})();
