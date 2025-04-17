const terminal = document.getElementById('terminal');
const input = document.getElementById('input');
const output = document.getElementById('output');
const blackScreen = document.getElementById('blackScreen');
const hiddenInput = document.getElementById('hiddenInput');
const adminButton = document.getElementById('adminButton');
const adminPanel = document.getElementById('adminPanel');
const closeAdminButton = document.getElementById('closeAdmin');
const clearOutputButton = document.getElementById('clearOutput');
const logoutButton = document.getElementById('logout');

let command = '';
let commandHistory = [];
let historyIndex = -1;
let loginStep = 0;
let isAdmin = false;
let sessionStartTime = new Date();
let commandCount = 0;
let clipboard = '';

const encodedUsername = 'YWRtaW4=';
const encodedPassword = 'MTAxNjIwMDc=';

const themes = {
    default: { backgroundColor: 'black', color: 'green', borderColor: 'green', cursorColor: 'green' },
    light: { backgroundColor: 'white', color: 'black', borderColor: 'gray', cursorColor: 'black' },
    dark: { backgroundColor: 'black', color: 'white', borderColor: 'white', cursorColor: 'white' },
    solarized: { backgroundColor: '#fdf6e3', color: '#657b83', borderColor: '#93a1a1', cursorColor: '#657b83' },
    dracula: { backgroundColor: '#282a36', color: '#f8f8f2', borderColor: '#bd93f9', cursorColor: '#bd93f9' },
    monokai: { backgroundColor: '#272822', color: '#f8f8f2', borderColor: '#66d9ef', cursorColor: '#66d9ef' },
    gruvbox: { backgroundColor: '#282828', color: '#ebdbb2', borderColor: '#d79921', cursorColor: '#d79921' },
    nord: { backgroundColor: '#2e3440', color: '#d8dee9', borderColor: '#81a1c1', cursorColor: '#81a1c1' },
    oceanic: { backgroundColor: '#1c1f24', color: '#abb2bf', borderColor: '#56b6c2', cursorColor: '#56b6c2' },
    palenight: { backgroundColor: '#292d3e', color: '#a6accd', borderColor: '#7e57c2', cursorColor: '#7e57c2' },
    one_dark: { backgroundColor: '#282c34', color: '#abb2bf', borderColor: '#61afef', cursorColor: '#61afef' },
    tokyo_night: { backgroundColor: '#1a1b26', color: '#c0caf5', borderColor: '#7aa2f7', cursorColor: '#7aa2f7' },
    night_owl: { backgroundColor: '#011627', color: '#d6deeb', borderColor: '#00d084', cursorColor: '#00d084' }
};

let currentTheme = localStorage.getItem('terminalTheme') || 'default';

function applyTheme(theme) {
    const themeStyles = themes[theme];
    document.body.style.backgroundColor = themeStyles.backgroundColor;
    document.body.style.color = themeStyles.color;
    terminal.style.borderColor = themeStyles.borderColor;
    const cursor = document.querySelector('.cursor');
    cursor.style.backgroundColor = themeStyles.cursorColor; 
    adminPanel.style.backgroundColor = themeStyles.backgroundColor;
}

applyTheme(currentTheme);

terminal.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const trimmedCommand = command.trim();
        if (trimmedCommand) {
            commandHistory.push(trimmedCommand);
            historyIndex = commandHistory.length;
            commandCount++;
        }

        if (trimmedCommand === 'login' && loginStep === 0) {
            output.innerHTML += '<br/>Username: ';
            command = '';
            loginStep = 1;
        } else if (loginStep === 1) {
            localStorage.setItem('username', trimmedCommand);
            output.innerHTML += '<br/>Password: ';
            command = '';
            loginStep = 2;
        } else if (loginStep === 2) {
            const username = localStorage.getItem('username');
            const decodedUsername = atob(encodedUsername);
            const decodedPassword = atob(encodedPassword);

            if (username === decodedUsername && trimmedCommand === decodedPassword) {
                output.innerHTML += '<br/>Login successful! Welcome, admin.';
                isAdmin = true;
                adminButton.classList.remove('hidden');
            } else {
                output.innerHTML += '<br/>Login failed. Incorrect username or password.';
            }
            command = '';
            loginStep = 0;
        } else {
            handleUserCommands(trimmedCommand);
        }

        input.innerHTML = '';
        command = '';
        output.scrollTop = output.scrollHeight;
    } else if (event.key === 'Backspace') {
        command = command.slice(0, -1);
        input.innerHTML = command;
    } else if (event.ctrlKey && event.key === 'Backspace') {
        command = '';
        input.innerHTML = command;
    } else if (event.key.length === 1) {
        command += event.key;
        input.innerHTML = command;
    } else if (event.key === 'ArrowUp') {
        if (historyIndex > 0) {
            historyIndex--;
            command = commandHistory[historyIndex];
            input.innerHTML = command;
        }
    } else if (event.key === 'ArrowDown') {
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            command = historyIndex === commandHistory.length ? '' : commandHistory[historyIndex];
            input.innerHTML = command;
        }
    }
    event.preventDefault();
});

const commandDescriptions = {
    help: 'Displays a list of available commands or detailed information about a specific command.',
    clear: 'Clears the terminal output.',
    echo: 'Displays the text following the command.',
    date: 'Shows the current date.',
    time: 'Shows the current time.',
    neofetch: 'Displays information about the browser and operating system.',
    whoami: 'Shows the current user (admin or user).',
    exit: 'Exits the terminal.',
    'theme [theme-name or number]': 'Changes the terminal theme to the specified theme.',
    themes: 'Lists all available themes.',
    about: 'Displays information about the terminal.',
    discord: 'Displays your Discord handle.',
    hackertime: 'Simulates hacking into the mainframe.',
    history: 'Displays the command history.',
    stats: 'Shows usage statistics for the terminal session.',
    fullscreen: 'Toggles fullscreen mode for the terminal.',
    back: 'Redirects you to the homepage.',
    rickroll: 'Redirects you to the Rick Astley - Never Gonna Give You Up video.',
    'what the': 'Displays "sigma".',
    'hi mom': 'Displays "Hello son".',
    admin: 'Grants admin access.',
    'im hungry': 'Suggests a random fast food item.',
    todo: 'Manages a todo list. Usage: todo add [task], todo list, or todo remove [index].',
    refresh: 'Refreshes the page.'
};

const fastFoodItems = [
    'Burger',
    'Fries',
    'Pizza',
    'Taco',
    'Sushi',
    'Hot Dogs',
    'Chicken Nuggets',
    'Ice Cream',
    'Sandwich',
    'Salad',
    'Doughnuts',
    'Wraps',
    'Subs',
    'Wings',
    'Quesadilla'
];

let todos = JSON.parse(localStorage.getItem('todos')) || [];

function handleUserCommands(trimmedCommand) {
    // Handle the 'help' command separately
    if (trimmedCommand.startsWith('help ')) {
        const specificCommand = trimmedCommand.split(' ')[1];
        if (specificCommand && commandDescriptions[specificCommand]) {
            output.innerHTML += `<br/>${specificCommand}: ${commandDescriptions[specificCommand]}`;
        } else {
            output.innerHTML += '<br/>Command not found. Use \'help\' to see available commands.';
        }
        return; // Exit early after handling the 'help' command
    }

    // Handle all other commands
    switch (trimmedCommand) {
        case 'help':
            const groupedCommands = {
                Authentication: ['login', 'logout', 'whoami'],
                System: ['date', 'time', 'neofetch', 'stats', 'clear', 'refresh'],
                User: ['echo', 'history', 'about', 'todo'],
                Admin: ['admin', 'hackertime', 'exit'],
                Appearance: ['theme [theme-name or number]', 'themes', 'fullscreen'],
                Miscellaneous: ['what the', 'hi mom', 'back', 'rickroll', 'discord', 'im hungry']
            };

            let helpOutput = '<br/>Available commands:<br/>';
            for (const group in groupedCommands) {
                helpOutput += `<strong>${group}:</strong> `;
                const commandsList = groupedCommands[group].map(cmd => `${cmd}`).join(', ');
                helpOutput += commandsList + '<br/>';
            }

            output.innerHTML += helpOutput;
            break;

        case 'clear':
            output.innerHTML = '';
            break;

        case 'date':
            const currentDate = new Date().toLocaleDateString();
            output.innerHTML += `<br/>${currentDate}`;
            break;

        case 'time':
            const currentTime = new Date().toLocaleTimeString();
            output.innerHTML += `<br/>${currentTime}`;
            break;

        case 'neofetch':
            const browserInfo = navigator.userAgent;
            const platform = navigator.platform;
            const language = navigator.language;
            const onlineStatus = navigator.onLine ? "Online" : "Offline";
            output.innerHTML +=  
                `<br/>Operating System: ${platform}
                <br/>Browser: ${browserInfo}
                <br/>Language: ${language}
                <br/>Status: ${onlineStatus}`;
            break;

        case 'whoami':
            output.innerHTML += `<br/>You are logged in as ${isAdmin ? 'admin' : 'user'}.`;
            break;

        case 'exit':
            output.innerHTML += '<br/>Exiting...';
            setTimeout(() => {
                blackScreen.classList.remove('hidden');
                blackScreen.style.opacity = 1;
            }, 1000);
            break;

        case 'logout':
            output.innerHTML += '<br/>Logging out...';
            isAdmin = false;
            adminButton.classList.add('hidden');
            adminPanel.classList.add('hidden');
            output.innerHTML += '<br/>Logged out';
            break;

        case 'back':
            window.location.href = 'https://ionos.glitch.me/';
            break;

        case 'rickroll':
            window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
            break;

        case 'themes':
            const themeList = Object.keys(themes).map((theme, index) => `[${index + 1}] ${theme}`).join('<br/>');
            output.innerHTML += `<br/>Available themes:<br/>${themeList}`;
            break;

        case 'about':
            output.innerHTML += '<br/>This terminal was created by ray as a fun project.';
            break;

        case 'discord':
            output.innerHTML += '<br/>My Discord is .exophs';
            break;

        case 'hackertime':
            simulateHacking();
            break;

        case 'history':
            output.innerHTML += '<br/>Command History: ' + (commandHistory.length ? commandHistory.join(', ') : 'No commands entered.');
            break;

        case 'stats':
            const sessionDuration = Math.floor((new Date() - sessionStartTime) / 1000);
            output.innerHTML += `<br/>Session Duration: ${sessionDuration} seconds<br/>Commands Executed: ${commandCount}`;
            break;

        case 'what the':
            output.innerHTML += '<br/>sigma';
            break;

        case 'hi mom':
            output.innerHTML += '<br/>Hello son';
            break;

        case 'admin':
            output.innerHTML += '<br/>lazy fuck';
            isAdmin = true;
            adminButton.classList.remove('hidden');
            break;

        case 'im hungry':
            const randomIndex = Math.floor(Math.random() * fastFoodItems.length);
            const randomFood = fastFoodItems[randomIndex];
            output.innerHTML += `<br/>You could go for some ${randomFood}!`;
            break;

        case 'todo':
            output.innerHTML += '<br/>Usage: todo add [task], todo list, or todo remove [index]';
            break;

        case 'fullscreen':
            if (document.fullscreenElement) {
                document.exitFullscreen();
                output.innerHTML += '<br/>Exited fullscreen mode.';
            } else {
                document.documentElement.requestFullscreen();
                output.innerHTML += '<br/>Entered fullscreen mode.';
            }
            break;

        case 'refresh':
            output.innerHTML += '<br/>Refreshing page...';
            setTimeout(() => {
                location.reload(); // Refresh the page
            }, 1000);
            break;

        default:
            if (trimmedCommand.startsWith('echo ')) {
                const textToEcho = trimmedCommand.slice(5);
                output.innerHTML += `<br/>${textToEcho}`;
            } else if (trimmedCommand.startsWith('theme ')) {
                const themeArg = trimmedCommand.split(' ')[1];
                if (themes[themeArg]) {
                    currentTheme = themeArg;
                    localStorage.setItem('terminalTheme', currentTheme);
                    applyTheme(currentTheme);
                    output.innerHTML += `<br/>Theme changed to ${themeArg}.`;
                } else if (!isNaN(themeArg) && themeArg > 0 && themeArg <= Object.keys(themes).length) {
                    currentTheme = Object.keys(themes)[themeArg - 1];
                    localStorage.setItem('terminalTheme', currentTheme);
                    applyTheme(currentTheme);
                    output.innerHTML += `<br/>Theme changed to ${currentTheme}.`;
                } else {
                    output.innerHTML += `<br/>Theme not recognized: ${themeArg}. Use 'themes' to see available themes.`;
                }
            } else if (trimmedCommand.startsWith('clipboard')) {
                output.innerHTML += `<br/>Clipboard: ${clipboard}`;
            } else if (trimmedCommand.startsWith('copy ')) {
                clipboard = trimmedCommand.slice(5);
                output.innerHTML += `<br/>Copied to clipboard: ${clipboard}`;
            } else if (trimmedCommand.startsWith('paste')) {
                output.innerHTML += `<br/>${clipboard}`;
            } else if (trimmedCommand.startsWith('todo ')) {
                const todoArgs = trimmedCommand.split(' ');
                const command = todoArgs[1];
            
                if (command === 'add') {
                    const todoItem = todoArgs.slice(2).join(' ');
                    if (todoItem) {
                        todos.push(todoItem);
                        localStorage.setItem('todos', JSON.stringify(todos));
                        output.innerHTML += `<br/>Added todo: "${todoItem}"`;
                    } else {
                        output.innerHTML += `<br/>Usage: todo add [task]`;
                    }
                } else if (command === 'list') {
                    if (todos.length > 0) {
                        output.innerHTML += '<br/>Your todos: <br/>' + todos.map((item, index) => `${index + 1}: ${item}`).join('<br/>');
                    } else {
                        output.innerHTML += '<br/>No todos found.';
                    }
                } else if (command === 'remove') {
                    const indexToRemove = parseInt(todoArgs[2]) - 1;
                    if (!isNaN(indexToRemove) && indexToRemove >= 0 && indexToRemove < todos.length) {
                        const removed = todos.splice(indexToRemove, 1);
                        localStorage.setItem('todos', JSON.stringify(todos));
                        output.innerHTML += `<br/>Removed todo: "${removed[0]}"`;
                    } else {
                        output.innerHTML += `<br/>Usage: todo remove [index]`;
                    }
                } else {
                    output.innerHTML += `<br/>Unknown todo command. Use "todo add", "todo list", or "todo remove".`;
                }            
            } else {
                output.innerHTML += `<br/>Command not recognized: ${trimmedCommand}`;
            }
    }
}

function simulateHacking() {
    output.innerHTML += '<br/>Initiating hacking sequence...<br/>';
    const messages = [
        "Connecting to server...",
        "Establishing secure connection...",
        "Bypassing firewalls...",
        "Accessing mainframe...",
        "Retrieving data...",
        "Decrypting files...",
        "Compiling results..."
    ];

    let messageIndex = 0;
    const hackingInterval = setInterval(() => {
        if (messageIndex < messages.length) {
            output.innerHTML += `${messages[messageIndex]}<br/>`;
            messageIndex++;
        } else {
            clearInterval(hackingInterval);
            const success = Math.random() < 0.5;
            if (success) {
                output.innerHTML += '<br/>Data retrieval successful!<br/>';
            } else {
                output.innerHTML += `<br/><span style="color: red; font-weight: bold;">Hacking failed! The FBI is watching you now. <span style="color: red;">HIDE</span></span><br/>`;
            }
            output.scrollTop = output.scrollHeight;
        }
    }, 1000);
}

adminButton.addEventListener('click', () => {
    adminPanel.classList.toggle('hidden');
    adminPanel.style.display = adminPanel.style.display === 'none' ? 'block' : 'none';
});

closeAdminButton.addEventListener('click', () => {
    adminPanel.classList.add('hidden');
    adminPanel.style.display = 'none';
});

clearOutputButton.addEventListener('click', () => {
    output.innerHTML = ''; 
});

logoutButton.addEventListener('click', () => {
    output.innerHTML += '<br/>Logging out...';
    isAdmin = false;
    adminButton.classList.add('hidden');
    adminPanel.classList.add('hidden');
    output.innerHTML += '<br/>Logged out';
});

blackScreen.addEventListener('click', () => {
    blackScreen.classList.add('hidden');
    blackScreen.style.opacity = 0;
    historyIndex = -1;
    terminal.focus();
});

terminal.focus();