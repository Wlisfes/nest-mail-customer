/**
 * CKEditor 5 编辑器配置模块
 * - GPL 免费版插件
 * - 工具栏配置
 * - 邮件编辑器友好设置
 */
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    FontColor,
    FontBackgroundColor,
    FontSize,
    FontFamily,
    Alignment,
    List,
    BlockQuote,
    Link,
    AutoLink,
    Image,
    ImageResize,
    ImageToolbar,
    ImageStyle,
    Table,
    TableToolbar,
    TableProperties,
    TableCellProperties,
    SpecialCharacters,
    SpecialCharactersEssentials,
    SourceEditing,
    Essentials,
    Paragraph,
    Heading,
    Indent,
    IndentBlock,
    HorizontalLine,
    GeneralHtmlSupport,
    Undo,
    PasteFromOffice
} from 'ckeditor5'

export const EDITOR_PLUGINS = [
    Essentials,
    Undo,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    FontColor,
    FontBackgroundColor,
    FontSize,
    FontFamily,
    Alignment,
    List,
    BlockQuote,
    Link,
    AutoLink,
    Image,
    ImageResize,
    ImageToolbar,
    ImageStyle,
    Table,
    TableToolbar,
    TableProperties,
    TableCellProperties,
    SpecialCharacters,
    SpecialCharactersEssentials,
    SourceEditing,
    Paragraph,
    Heading,
    Indent,
    IndentBlock,
    HorizontalLine,
    GeneralHtmlSupport,
    PasteFromOffice
]

export const EDITOR_TOOLBAR = {
    items: [
        'undo',
        'redo',
        '|',
        'heading',
        '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        '|',
        'fontSize',
        'fontFamily',
        'fontColor',
        'fontBackgroundColor',
        '|',
        'alignment',
        '|',
        'bulletedList',
        'numberedList',
        'outdent',
        'indent',
        '|',
        'blockQuote',
        'horizontalLine',
        '|',
        'link',
        'insertImage',
        'insertTable',
        'specialCharacters',
        '|',
        'sourceEditing'
    ],
    shouldNotGroupWhenFull: false
}

export function getEditorConfig() {
    return {
        licenseKey: 'GPL',
        plugins: EDITOR_PLUGINS,
        toolbar: EDITOR_TOOLBAR,
        language: 'zh-cn',
        placeholder: '请输入邮件正文...',
        fontSize: {
            options: [12, 13, 14, 15, 16, 18, 20, 24, 28, 32, 36],
            supportAllValues: true
        },
        fontFamily: {
            options: [
                'default',
                'Arial, Helvetica, sans-serif',
                'Georgia, serif',
                'Tahoma, Geneva, sans-serif',
                'Verdana, Geneva, sans-serif',
                'Microsoft YaHei, 微软雅黑, sans-serif',
                'SimSun, 宋体, serif',
                'KaiTi, 楷体, serif'
            ]
        },
        heading: {
            options: [
                { model: 'paragraph', title: '正文', class: 'ck-heading_paragraph' },
                { model: 'heading1', view: 'h1', title: '标题 1', class: 'ck-heading_heading1' },
                { model: 'heading2', view: 'h2', title: '标题 2', class: 'ck-heading_heading2' },
                { model: 'heading3', view: 'h3', title: '标题 3', class: 'ck-heading_heading3' }
            ]
        },
        image: {
            toolbar: ['imageStyle:inline', 'imageStyle:block', '|', 'imageTextAlternative'],
            resizeUnit: 'px'
        },
        table: {
            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
        },
        link: {
            addTargetToExternalLinks: true,
            defaultProtocol: 'https://'
        },
        htmlSupport: {
            allow: [{ name: /.*/, attributes: true, classes: true, styles: true }]
        }
    }
}
