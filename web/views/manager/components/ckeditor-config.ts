/**
 * CKEditor 5 编辑器配置模块
 * 延迟加载以兼容 SSR（避免服务端访问 DOM API）
 */

let _config: any = null

export async function getEditorConfig() {
    if (_config) return _config

    const ck = await import('ckeditor5')

    const plugins = [
        ck.Essentials,
        ck.Undo,
        ck.Bold,
        ck.Italic,
        ck.Underline,
        ck.Strikethrough,
        ck.FontColor,
        ck.FontBackgroundColor,
        ck.FontSize,
        ck.FontFamily,
        ck.Alignment,
        ck.List,
        ck.BlockQuote,
        ck.Link,
        ck.AutoLink,
        ck.Image,
        ck.ImageResize,
        ck.ImageToolbar,
        ck.ImageStyle,
        ck.Table,
        ck.TableToolbar,
        ck.TableProperties,
        ck.TableCellProperties,
        ck.SpecialCharacters,
        ck.SpecialCharactersEssentials,
        ck.SourceEditing,
        ck.Paragraph,
        ck.Heading,
        ck.Indent,
        ck.IndentBlock,
        ck.HorizontalLine,
        ck.GeneralHtmlSupport,
        ck.PasteFromOffice
    ]

    _config = {
        licenseKey: 'GPL',
        plugins,
        toolbar: {
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
        },
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
                { model: 'paragraph' as const, title: '正文', class: 'ck-heading_paragraph' },
                { model: 'heading1' as const, view: 'h1', title: '标题 1', class: 'ck-heading_heading1' },
                { model: 'heading2' as const, view: 'h2', title: '标题 2', class: 'ck-heading_heading2' },
                { model: 'heading3' as const, view: 'h3', title: '标题 3', class: 'ck-heading_heading3' }
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

    return _config
}
