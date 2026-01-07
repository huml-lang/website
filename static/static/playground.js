// Global variables.
let leftEditor, rightEditor;
let leftFormat = 'json';
let rightFormat = 'yaml';

// Initialize the application when DOM is loaded.
document.addEventListener('DOMContentLoaded', function () {
    // Wait a bit for the TOML module to load.
    setTimeout(() => {
        initEditors();
        initListners();
    }, 100);
});

// Initialize CodeMirror editors.
function initEditors() {
    const cfg = {
        lineNumbers: true,
        viewportMargin: Infinity,
        mode: 'application/json',
        theme: 'ayu-mirage',
        tabSize: 2,
        indentWithTabs: false,
        lineWrapping: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
    };

    document.querySelector('.playground').style.display = 'block';

    // Left editor (input).
    leftEditor = CodeMirror.fromTextArea(document.querySelector('#editor-left'), cfg);

    // Right editor (output).
    rightEditor = CodeMirror.fromTextArea(document.querySelector('#editor-right'), { ...cfg, readOnly: true });

    // Add change listener to left editor.
    leftEditor.on('change', function () {
        updateUIState(false, 'draft');
    });

    // Set initial content examples.
    setExampleContent();

}

// Initialize event listeners.
function initListners() {
    const formatLeft = document.querySelector('#format-left');
    formatLeft.addEventListener('change', function () {
        updateEditorMode(leftEditor, formatLeft.value);
        updateUIState(false, 'draft');
    });

    const formatRight = document.querySelector('#format-right');
    formatRight.addEventListener('change', function () {
        convertContent();
    });

    // Copy buttons..
    document.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            copyToClipboard(e.target, this.getAttribute('data-side'));
        });
    });

    // Convert button..
    document.querySelector('#btn-convert').addEventListener('click', function (e) {
        e.preventDefault();
        convertContent();
    });

    // Swap buttoin.
    document.querySelector('.btn-swap').addEventListener('click', function (e) {
        e.preventDefault();
        const leftFormat = document.querySelector('#format-left');
        const rightFormat = document.querySelector('#format-right');

        // Swap formats.
        const temp = leftFormat.value;
        leftFormat.value = rightFormat.value;
        rightFormat.value = temp;

        // Update editor modes.
        updateEditorMode(leftEditor, leftFormat.value);
        updateEditorMode(rightEditor, rightFormat.value);

        // Swap editor content.
        const leftContent = leftEditor.getValue();
        const rightContent = rightEditor.getValue();
        leftEditor.setValue(rightContent);
        rightEditor.setValue(leftContent);

        convertContent();
    });

    leftEditor.on('drop', function (cm, e) {
        const files = e.dataTransfer.files;
        if (files.length != 1) {
            e.preventDefault();
            e.stopPropagation();
            alert('Please drop a single file.');
            return;
        }

        const file = files[0];

        // Validate file type from extension.
        const match = file.name.match(/\.(huml|json|toml|yaml|yml)$/i);
        const ext = match ? match[1].toLowerCase() : null;

        if (!ext) {
            alert('Only files with extensions .huml, .json, .yaml, .yml, or .toml are supported');
            e.preventDefault();
            e.stopPropagation();
            return;
        }
    });
}

// Update CodeMirror editor mode based on format.
function updateEditorMode(editor, format) {
    const modes = {
        'huml': 'huml',
        'json': 'application/json',
        'yaml': 'text/x-yaml',
        'toml': 'text/x-toml'
    };

    const mode = modes[format] || 'text/plain';
    editor.setOption('mode', mode);
}

// Convert content from left to right format.
function convertContent() {
    const content = leftEditor.getValue();
    const leftFormat = document.querySelector('#format-left').value;
    const rightFormat = document.querySelector('#format-right').value;

    // Clear previous messages.
    hideMessages();

    if (!content) {
        rightEditor.setValue('');
        return;
    }

    let src;
    try {
        // Parse the input based on left format.
        switch (leftFormat) {
            case 'huml':
                src = window.jsHuml.parse(content);
                break;
            case 'json':
                src = JSON.parse(content);
                break;
            case 'yaml':
                src = jsyaml.load(content);
                break;
            case 'toml':
                // Use the js-toml library.
                src = window.jsToml.parse(content);
                break;
            default:
                throw new Error('Unsupported input format');
        }
    } catch (error) {
        rightEditor.setValue('');
        showError('error-left', `Parse error: ${error.message}`);
        updateUIState(true, 'error');
        return;
    }

    let output;
    try {
        // Convert to target format.
        switch (rightFormat) {
            case 'huml':
                output = window.jsHuml.stringify(src);
                break;
            case 'json':
                output = JSON.stringify(src, null, 2);
                break;
            case 'yaml':
                output = jsyaml.dump(src, {
                    indent: 2,
                    lineWidth: 80,
                    noRefs: true,
                    sortKeys: false
                });
                break;
            case 'toml':
                // Use the js-toml library.
                output = window.jsToml.stringify(src);
                break;
            default:
                throw new Error('Unsupported output format');
        }

        updateEditorMode(leftEditor, leftFormat);
        rightEditor.setValue(output);
        updateEditorMode(rightEditor, rightFormat);
        updateUIState(true, 'success');

    } catch (error) {
        rightEditor.setValue('');
        showError('error-right', `Parse error: ${error.message}`);
        updateUIState(true, 'error');
    }
}

// Show error message.
function showError(elId, message) {
    const el = document.getElementById(elId);
    el.textContent = message;
    el.style.display = 'block';
}

// Update button/editor states.
function updateUIState(lock, typ) {
    const wrap = document.querySelector('.editor-wrap-right');
    wrap.style.opacity = 1;
    const btn = document.querySelector('#btn-convert');
    if (typ === 'error') {
        btn.innerText = "Error";
    } else if (typ === 'success') {
        btn.innerText = "Success!";
    } else if (typ === 'draft') {
        btn.innerText = "Convert →";
        wrap.style.opacity = 0.3;
    }

    if (lock) {
        btn.disabled = true;
    } else {
        btn.disabled = false;
    }
}

// Hide all messages.
function hideMessages() {
    document.querySelector('#error-left').style.display = 'none';
    document.querySelector('#error-right').style.display = 'none';
}

// Copy content to clipboard.
function copyToClipboard(el, side) {
    let content;
    if (side === 'left') {
        content = leftEditor.getValue();
    } else {
        content = rightEditor.getValue();
    }

    let msg = 'Copied to clipboard!';
    if (!content) {
        msg = 'Nothing to copy!';
    } else {
        try {
            navigator.clipboard.writeText(content);
        } catch (err) {
            msg = 'Error: ' + err.message;
        }
    }

    // Show the message in the element for 2 seconds before reverting to the original text..
    const last = el.innerText;
    el.innerText = msg;
    el.classList.add('disabled');
    setTimeout(() => {
        el.innerText = last;
        el.classList.remove('disabled');
    }, 2000);
}

// Set example content for demonstration.
function setExampleContent() {
    const str = `\
# A sample HUML document.
website::
  hostname: "huml.io"
  ports:: 80, 443 # Inline list.
  enabled: true
  factor: 3.14

  # Inline dict below.
  props:: mime_type: "text/html", encoding: "gzip"
  tags:: # Multi-line list.
    - "markup"
    - "webpage"
    - "schema"

mixed_list:: 1, 2, "three", true

haikus::
  one: """
    A quiet language
    Lines fall into their places
    Nothing out of place
  """
`;

    document.querySelector('#format-left').value = 'huml';
    document.querySelector('#format-right').value = 'json';

    leftEditor.setValue(str);
    rightEditor.setValue('');
    hideMessages();

    setTimeout(() => {
        convertContent();
    }, 100);
}
