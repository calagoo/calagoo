document.addEventListener('click', function() {
    document.getElementById('input').focus();
});

document.addEventListener('DOMContentLoaded', () => {
    const inputElement = document.getElementById('input');
    inputElement.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const inputValue = inputElement.value.trim();
            // Clear the input
            inputElement.value = '';

            // Split the command and the arguments
            const commandParts = inputValue.split(' ');
            const command = commandParts[0];
            const args = commandParts.slice(1).join(' ');

            // Create a new line for the command
            const newLine = document.createElement('div');
            newLine.textContent = `$ ${inputValue}`;
            const output = document.getElementById('output');
            output.appendChild(newLine);

            // Process the command
            processCommand(command, args);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            tabComplete();
        }
    });
});

// List of all commands and args:
const commands = [
    { command: 'echo'},
    { command: 'help' },
    { command: 'clear' },
    { command: 'ls' },
    { command: 'cat', args: ['main_page.txt', 'about_me.txt', 'contact.txt', 'projects.txt', 'resume.txt']},
];

function tabComplete() {
    const input = document.getElementById('input');
    const inputValue = input.value;
    const commandParts = inputValue.split(' ');
    const command = commandParts[0];
    const args = commandParts.slice(1).join(' ');

    const matchingCommands = commands.filter(cmd => cmd.command.startsWith(command));
    if (matchingCommands.length === 1) {
        const completedCommand = matchingCommands[0].command;
        input.value = completedCommand + ' ' + args;
    }
}

function catCommand(args) {
    const output = document.getElementById('output');
    const newLine = document.createElement('div');

    if (args === 'main_page.txt') {
        newLine.textContent = 'Welcome to my personal website!';
    }
    else if (args === 'about_me.txt') {
        newLine.textContent = 'I am a software developer.';
    }
    else if (args === 'contact.txt') {
        newLine.textContent = 'You can contact me at: robbierodriguez98@gmail.com';
    }
    else if (args === 'projects.txt') {
        newLine.textContent = 'These are my projects:';
    }
    else if (args === 'resume.txt') {
        newLine.textContent = 'This is my resume:';
    }
    else {
        newLine.textContent = `File not found: ${args}`;
    }

    output.appendChild(newLine);
    // Auto scroll to the bottom of the output
    output.scrollTop = output.scrollHeight;
}

function processCommand(command, args) {
    const output = document.getElementById('output');
    const newLine = document.createElement('div');
    
    switch(command) {
        case 'echo':
            newLine.textContent = args;
            break;
        case 'help':
            newLine.textContent = 'Available commands: echo, help, clear, ls, cat';
            break;
        case 'clear':
            output.innerHTML = '';
            return;
        case 'ls':
            newLine.textContent = 'main_page.txt  about_me.txt  contact.txt  projects.txt  resume.txt';
            break;
        case 'cat':
            catCommand(args);
            break
        default:
            newLine.textContent = `Unknown command: ${command}`;
            break;
        }

    output.appendChild(newLine);
    // Auto scroll to the bottom of the output
    output.scrollTop = output.scrollHeight;
}
