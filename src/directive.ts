import {Directive, EventEmitter, Output, ElementRef, Input} from '@angular/core';
import 'brace';
import 'brace/theme/monokai';
import 'brace/mode/html';

declare var ace: any;

@Directive({
    selector: '[ace-editor]'
})
export class AceEditorDirective {
    @Output() textChanged = new EventEmitter();
    @Output() textChange = new EventEmitter();
    _options: any = {};
    _readOnly: boolean = false;
    _theme: string = "monokai";
    _mode: any = "html";
    _autoUpdateContent: boolean = true;
    _durationBeforeCallback: number = 0;
    _text: string = "";
    editor: any;
    oldText: any;
    timeoutSaving: any;

    constructor(elementRef: ElementRef) {
        let el = elementRef.nativeElement;
        this.editor = ace["edit"](el);

        this.init();
        this.initEvents();
    }

    init() {
        this.editor.setOptions(this._options || {});
        this.editor.setTheme(`ace/theme/${this._theme}`);
        this.setMode(this._mode);
        this.editor.setReadOnly(this._readOnly);
    }

    initEvents() {
        let me = this;

        me.editor.on('change', () => {
            let newVal = this.editor.getValue();
            if (newVal === this.oldText) return;
            if (typeof me.oldText !== 'undefined') {
                if (me._durationBeforeCallback == 0) {
                    me._text = newVal;
                    me.textChange.emit(newVal);
                    me.textChanged.emit(newVal);
                } else {
                    if (me.timeoutSaving != null)
                        clearTimeout(me.timeoutSaving);

                    me.timeoutSaving = setTimeout(function () {
                        me._text = newVal;
                        me.textChange.emit(newVal);
                        me.textChanged.emit(newVal);
                        me.timeoutSaving = null;
                    }, me._durationBeforeCallback);
                }
            }
            this.oldText = newVal;
        });
    }

    @Input() set options(options: any) {
        this._options = options;
        this.editor.setOptions(options || {});
    }

    @Input() set readOnly(readOnly: any) {
        this._readOnly = readOnly;
        this.editor.setReadOnly(readOnly);
    }

    @Input() set theme(theme: any) {
        this._theme = theme;
        this.editor.setTheme(`ace/theme/${theme}`);
    }

    @Input() set mode(mode: any) {
        this.setMode(mode);
    }

    setMode(mode: any) {
        this._mode = mode;
        if (typeof this._mode == 'object') {
            this.editor.getSession().setMode(this._mode);
        }
        else {
            this.editor.getSession().setMode(`ace/mode/${this._mode}`);
        }
    }

    @Input()
    get text() {
        return this._text;
    }
    set text(text: string) {
        this.setText(text);
    }

    setText(text: any) {
        if (text == null)
            text = "";

        if (this._autoUpdateContent == true) {
            this._text = text;
            this.editor.setValue(text);
            this.editor.clearSelection();
            this.editor.focus();
        }
    }

    @Input() set autoUpdateContent(status: any) {
        this._autoUpdateContent = status;
    }

    @Input() set durationBeforeCallback(num: number) {
        this.setDurationBeforeCallback(num);
    }

    setDurationBeforeCallback(num: number) {
        this._durationBeforeCallback = num;
    }

    get aceEditor() {
        return this.editor;
    }
}
