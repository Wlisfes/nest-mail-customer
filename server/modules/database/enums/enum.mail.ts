export enum MailProvider {
    QQ = 'qq',
    NETEASE = '163',
    OUTLOOK = 'outlook',
    GMAIL = 'gmail'
}

/**邮箱平台默认配置**/
export const MAIL_PROVIDER_CONFIG: Record<
    MailProvider,
    {
        imapHost: string
        imapPort: number
        smtpHost: string
        smtpPort: number
    }
> = {
    [MailProvider.QQ]: {
        imapHost: 'imap.qq.com',
        imapPort: 993,
        smtpHost: 'smtp.qq.com',
        smtpPort: 465
    },
    [MailProvider.NETEASE]: {
        imapHost: 'imap.163.com',
        imapPort: 993,
        smtpHost: 'smtp.163.com',
        smtpPort: 465
    },
    [MailProvider.OUTLOOK]: {
        imapHost: 'outlook.office365.com',
        imapPort: 993,
        smtpHost: 'smtp-mail.outlook.com',
        smtpPort: 587
    },
    [MailProvider.GMAIL]: {
        imapHost: 'imap.gmail.com',
        imapPort: 993,
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587
    }
}
