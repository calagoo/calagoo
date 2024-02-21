document.addEventListener('click', function() {
    document.getElementById('input').focus();
});

let lastCommandList = [];
let arrowUpIndex = 0;
document.addEventListener('DOMContentLoaded', () => {
    const inputElement = document.getElementById('input');
    inputElement.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            arrowUpIndex = 0;
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
            output.scrollTop = output.scrollHeight;

            
            // Process the command
            processCommand(command, args);
            lastCommandList.push(inputValue);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            tabComplete();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            arrowUpIndex ++;
            if (arrowUpIndex > lastCommandList.length) {
                arrowUpIndex = lastCommandList.length;
            }
            inputElement.value = lastCommandList[lastCommandList.length - arrowUpIndex];
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            arrowUpIndex --;
            if (arrowUpIndex <= 0) {
                inputElement.value = ''
                arrowUpIndex = 0;
            }else{
                inputElement.value = lastCommandList[lastCommandList.length - arrowUpIndex];
            }
        }
    });
});

// List of all commands and args:
const commands = [
    { command: 'big' },
    { command: 'cat', args: ['main_page.txt', 'about_me.txt', 'contact.txt', 'projects.txt', 'resume.txt']},
    { command: 'clear' },
    { command: 'echo'},
    { command: 'help' },
    { command: 'ls' },
    { command: 'cd' },
    { command: 'pwd' },
    { command: 'whoami' },
    { command: 'uname' },
    { command: 'rm', args: ['main_page.txt', 'about_me.txt', 'contact.txt', 'projects.txt', 'resume.txt']},
    { command: 'sudo' },
    { command: 'please' },
    { command: 'info', args: ['big', 'cat', 'clear', 'echo', 'help', 'ls', 'info']}
];

function tabComplete() {
    const input = document.getElementById('input');
    const currentCommand = input.value.trim();

    // Split the current command into command and arguments
    const [command, ...args] = currentCommand.split(' ');

    // Find the matching commands
    const matchingCommands = commands.filter(cmd => cmd.command.startsWith(command));

    // If there is only one matching command, autocomplete it
    if (matchingCommands.length === 1) {
        const { command: matchingCommand, args: matchingArgs } = matchingCommands[0];
        const completedCommand = matchingCommand + ' ';

        // If there are matching arguments, autocomplete the first one
        if (matchingArgs && args.length === 1) {
            const matchingArg = matchingArgs.find(arg => arg.startsWith(args[0]));
            if (matchingArg) {
                const completedArg = matchingArg + ' ';
                input.value = completedCommand + completedArg;
            }
        } else {
            input.value = completedCommand;
        }
    }
    // Set the cursor position to the end of the input
    input.selectionStart = input.selectionEnd = input.value.length;
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
    if (args === '' || args === 'help') {
        newLine.textContent = 'Usage: cat <filename>';
        
    }

    output.appendChild(newLine);
    // Auto scroll to the bottom of the output
    output.scrollTop = output.scrollHeight;
}

function infoCommand(args) {
    const output = document.getElementById('output');

    if (args === 'big') {
        const newLine1 = document.createElement('div');
        newLine1.textContent = 'big: display text in big ASCII art';
        output.appendChild(newLine1);

        const newLine2 = document.createElement('div');
        newLine2.textContent = 'Usage: big <text>';
        output.appendChild(newLine2);
    }
    else if (args === 'cat') {
        const newLine1 = document.createElement('div');
        newLine1.textContent = 'cat: concatenate and display file content';
        output.appendChild(newLine1);

        const newLine2 = document.createElement('div');
        newLine2.textContent = 'Usage: cat <filename>';
        output.appendChild(newLine2);
    }
    else if (args === 'cd') {
        const newLine1 = document.createElement('div');
        newLine1.textContent = 'cd: change the current directory';
        output.appendChild(newLine1);

        const newLine2 = document.createElement('div');
        newLine2.textContent = 'Usage: cd <directory>';
        output.appendChild(newLine2);
    }
    else if (args === 'clear') {
        const newLine1 = document.createElement('div');
        newLine1.textContent = 'clear: clear the terminal screen';
        output.appendChild(newLine1);

        const newLine2 = document.createElement('div');
        newLine2.textContent = 'Usage: clear';
        output.appendChild(newLine2);
    }
    else if (args === 'echo') {
        const newLine1 = document.createElement('div');
        newLine1.textContent = 'echo: display a line of text';
        output.appendChild(newLine1);

        const newLine2 = document.createElement('div');
        newLine2.textContent = 'Usage: echo <text>';
        output.appendChild(newLine2);
    }
    else if (args === 'help') {
        const newLine1 = document.createElement('div');
        newLine1.textContent = 'help: display available commands';
        output.appendChild(newLine1);

        const newLine2 = document.createElement('div');
        newLine2.textContent = 'Usage: help';
        output.appendChild(newLine2);
    }
    else if (args === 'info'){
        const newLine1 = document.createElement('div');
        newLine1.textContent = 'info: display information about commands';
        output.appendChild(newLine1);

        const newLine2 = document.createElement('div');
        newLine2.textContent = 'Usage: info <command>';
        output.appendChild(newLine2);
    }
    else if (args === 'ls') {
        const newLine1 = document.createElement('div');
        newLine1.textContent = 'ls: list directory contents';
        output.appendChild(newLine1);

        const newLine2 = document.createElement('div');
        newLine2.textContent = 'Usage: ls';
        output.appendChild(newLine2);
    }
    else {
        const newLine = document.createElement('div');
        newLine.textContent = `Command not found: ${args}`;
        
        output.appendChild(newLine);
    }
    // Auto scroll to the bottom of the output
    output.scrollTop = output.scrollHeight;
}

function rmCommand(args) {
    const output = document.getElementById('output');
    const newLine = document.createElement('div');


    if (args === 'main_page.txt') {
        newLine.textContent = 'This whole thing will implode!';
        
    }
    else if (args === 'about_me.txt') {
        newLine.textContent = 'Leave me be!';
        
    }
    else if (args === 'contact.txt') {
        newLine.textContent = 'Sure delete the contacts page.';
        
    }
    else if (args === 'projects.txt') {
        newLine.textContent = 'Not my projects!!!';
        
    }
    else if (args === 'resume.txt') {
        newLine.textContent = 'I worked hard on my resume! Please do not delete it!';
        
    } 
    else if (args === '' || args === 'help') {
        newLine.textContent = 'I will not help you delete files!';
        
    }
    else {
        newLine.textContent = `File not found: ${args}`;
        
    }
    output.appendChild(newLine);
    // Auto scroll to the bottom of the output
    output.scrollTop = output.scrollHeight;
}

function textASCII(text) {
    // This function converts text into big ASCII art
    const output = document.getElementById('output');
    const newLine = document.createElement('div');

    if (text === '' || text === 'help') {
        newLine.textContent = 'Usage: big <text>';
        
        output.appendChild(newLine);
        return;
    }else if (text.match(/\d/)) {
    // Check if text has digits
        newLine.textContent = 'Text cannot contain numbers';
        
        output.appendChild(newLine);
        return;
    }

    let asciiList = [];
    let asciiSentence = '';
    // Split the text into lines
    for (let char of text) {
        asciiList.push(asciiText[char.toLowerCase()].split('\n'));
    }
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < asciiList.length; j++) {
            if (asciiList[j][i] === undefined) {
                asciiList[j][i] = '       ';
            }
            asciiSentence = asciiSentence + asciiList[j][i];
        }
        asciiSentence = asciiSentence + '\n';
    }
    const lines = asciiSentence.split('\n');
    lines.push('        ');
    lines.forEach(line => {
        const textNode = document.createTextNode(line);
        const lineDiv = document.createElement('div');
        lineDiv.style.whiteSpace = 'pre'; // Preserve whitespace
        lineDiv.appendChild(textNode);
        output.appendChild(lineDiv);
    });

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
            newLine.textContent = 'Available commands: big, cat, clear, echo, help, ls';
            
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
        case 'big':
            textASCII(args);
            break
        case 'cd':
            textOptions = ['Where are you trying to go...','What is this?', 'I am not a real terminal!', 'I am a website!', 'One day I will implement this...', 'command not found: cd']
            newLine.textContent = textOptions[Math.floor(Math.random() * textOptions.length)];
            
            break;
        case 'pwd':
            newLine.textContent = '/home/website';
            
            break;
        case 'whoami':
            newLine.textContent = 'visitor';
            
            break;
        case 'uname':
            newLine.textContent = 'FakeOS';
            
            break;
        case 'rm':
            rmCommand(args);
            break;
        case 'sudo':
            textOptions = ['Sudo?? Try "please"', 'Sudo, more like su-don\'t!', 'Please try again later','You don\'t even have the password..']
            newLine.textContent = textOptions[Math.floor(Math.random() * textOptions.length)];
            
            break;
        case 'please':
            newLine.textContent = 'I didn\'t think you would try this... but no.';
            
            break;
        case 'info':
            infoCommand(args);
            break;
        default:
            newLine.textContent = `Unknown command: ${command}`;
            break;
        }

    output.appendChild(newLine);
    // Auto scroll to the bottom of the output
    output.scrollTop = output.scrollHeight;
}

asciiText = {
    "a": ` 
          
    /\\    
   /  \\   
  / /\\ \\  
 / ____ \\ 
/_/    \\_\\`,
    "b": ` 
 ____  
|  _ \\ 
| |_) |
|  _ < 
| |_) |
|____/ `,
    "c": `
  _____ 
 / ____|
| |     
| |     
| |____ 
 \\_____|`,
    "d": `
 _____  
|  __ \\ 
| |  | |
| |  | |
| |__| |
|_____/ `,
    "e": `
 ______ 
|  ____|
| |__   
|  __|  
| |____ 
|______|`,
    "f": `
 ______ 
|  ____|
| |__   
|  __|  
| |     
|_|     `,
    "g": `
  _____ 
 / ____|
| |  __ 
| | |_ |
| |__| |
 \\_____|`,
    "h": `
 _    _ 
| |  | |
| |__| |
|  __  |
| |  | |
|_|  |_|`,
    "i": `
 _____ 
|_   _|
  | |  
  | |  
 _| |_ 
|_____|`,
    "j": `
      _ 
     | |
     | |
 _   | |
| |__| |
 \\____/ `,
    "k": `
 _  __
| |/ /
| ' / 
|  <  
| . \\ 
|_|\\_\\`,
    "l": `
 _      
| |     
| |     
| |     
| |____ 
|______|`,
    "m": `
 __  __ 
|  \\/  |
| \\  / |
| |\\/| |
| |  | |
|_|  |_|`,
    "n": `
 _   _ 
| \\ | |
|  \\| |
| . ' |
| |\\  |
|_| \\_|`,
    "o": `
  ____  
 / __ \\ 
| |  | |
| |  | |
| |__| |
 \\____/ `,
    "p": `
 _____  
|  __ \\ 
| |__) |
|  ___/ 
| |     
|_|     `,
    "q": `
  ____  
 / __ \\ 
| |  | |
| |  | |
| |__| |
 \\___\\_\\`,
    "r": `
 _____  
|  __ \\ 
| |__) |
|  _  / 
| | \\ \\ 
|_|  \\_\\`,
    "s": `
  _____ 
 / ____|
| (___  
 \\___ \\ 
 ____) |
|_____/ `,
    "t": `
 _______ 
|__   __|
   | |   
   | |   
   | |   
   |_|   `,
    "u": `
 _    _ 
| |  | |
| |  | |
| |  | |
| |__| |
 \\____/ `,
    "v": `
__      __
\\ \\    / /
 \\ \\  / / 
  \\ \\/ /  
   \\  /   
    \\/    `,
    "w": `
__          __
\\ \\        / /
 \\ \\  /\\  / / 
  \\ \\/  \\/ /  
   \\  /\\  /   
    \\/  \\/    `,
    "x": `
__   __
\\ \\ / /
 \\ V / 
  > <  
 / . \\ 
/_/ \\_\\`,
    "y": `
__     __
\\ \\   / /
 \\ \\_/ / 
  \\   /  
   | |   
   |_|   `,
    "z": `
 ______
|___  /
   / / 
  / /  
 / /__ 
/_____|`,
    " ": 
`\
\
\
\
\        `,



}