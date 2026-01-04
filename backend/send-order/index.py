import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

def handler(event: dict, context) -> dict:
    """
    Обработка заказа и отправка на email администратора
    """
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }

    try:
        body = json.loads(event.get('body', '{}'))
        
        customer_name = body.get('customerName', '')
        customer_email = body.get('customerEmail', '')
        customer_phone = body.get('customerPhone', '')
        comment = body.get('comment', '')
        items = body.get('items', [])
        total_amount = body.get('totalAmount', 0)

        if not customer_name or not customer_email or not customer_phone:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Missing required fields'}),
                'isBase64Encoded': False
            }

        email_body = format_email(
            customer_name, 
            customer_email, 
            customer_phone, 
            comment, 
            items, 
            total_amount
        )

        admin_email = os.environ.get('ADMIN_EMAIL', 'test@example.com')
        smtp_host = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
        smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        smtp_user = os.environ.get('SMTP_USER', '')
        smtp_password = os.environ.get('SMTP_PASSWORD', '')

        if smtp_user and smtp_password:
            send_email(
                smtp_host,
                smtp_port,
                smtp_user,
                smtp_password,
                admin_email,
                'Новый заказ из каталога сувениров',
                email_body
            )

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Order sent successfully',
                'orderId': f"ORD-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
            }),
            'isBase64Encoded': False
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def format_email(name: str, email: str, phone: str, comment: str, items: list, total: float) -> str:
    """Форматирование письма с заказом"""
    items_html = ''
    for item in items:
        items_html += f"""
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">{item['name']}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">{item['quantity']} шт.</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">{item['price']:,} ₽</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">{item['total']:,} ₽</td>
        </tr>
        """

    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0EA5E9; border-bottom: 2px solid #0EA5E9; padding-bottom: 10px;">
                Новый заказ из каталога сувениров
            </h2>
            
            <div style="margin: 20px 0;">
                <h3 style="color: #555;">Данные покупателя:</h3>
                <p><strong>Имя:</strong> {name}</p>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Телефон:</strong> {phone}</p>
                {f'<p><strong>Комментарий:</strong> {comment}</p>' if comment else ''}
            </div>

            <div style="margin: 20px 0;">
                <h3 style="color: #555;">Состав заказа:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f8f9fa;">
                            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Товар</th>
                            <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Кол-во</th>
                            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Цена</th>
                            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Сумма</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items_html}
                    </tbody>
                </table>
            </div>

            <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
                <h3 style="margin: 0; color: #0EA5E9;">Итого: {total:,} ₽</h3>
            </div>

            <p style="color: #999; font-size: 12px; margin-top: 30px;">
                Заказ получен: {datetime.now().strftime('%d.%m.%Y %H:%M')}
            </p>
        </div>
    </body>
    </html>
    """
    return html


def send_email(host: str, port: int, user: str, password: str, to: str, subject: str, body: str):
    """Отправка email через SMTP"""
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = user
    msg['To'] = to

    html_part = MIMEText(body, 'html', 'utf-8')
    msg.attach(html_part)

    with smtplib.SMTP(host, port) as server:
        server.starttls()
        server.login(user, password)
        server.send_message(msg)
