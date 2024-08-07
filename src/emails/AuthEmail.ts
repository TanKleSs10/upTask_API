import { transport } from "../config/nodemailer";

interface IEmail {
  email: string;
  name: string;
  token: string;
}

export class AuthEmail {
  static sendConfirmationEmail = async (user: IEmail) => {
    const info = await transport.sendMail({
      from: "UpTask <admin@upTask.com>",
      to: user.email,
      subject: "UpTask - Confirma tu cuenta",
      text: "UpTask - Confirma tu cuenta",
      html: `<p>Hola ${user.name}, has creado tu cuenta en UpTask, ya casi esta todo listo solo debes de confirmar tu cuenta</p>
      <p>Visita el siguiente enlace:</p>
      <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirma Cuenta</a>
      <p>E ingresa el codigo:<b> ${user.token}</b></p>
      <p>este Token expira en 10 minutos</p>
      `,
    });
    console.log("mensaje enviado", info.messageId);
  };
  static sendPasswordResetToken = async (user: IEmail) => {
    const info = await transport.sendMail({
      from: "UpTask <admin@upTask.com>",
      to: user.email,
      subject: "Reestablece tu contraseña",
      text: "Reestablece tu contraseña",
      html: `<p>Hola ${user.name}, has solicitado reestablecer tu contraseña:</p>
      <a href="${process.env.FRONTEND_URL}/auth/new-password">Reestablecer contraseña</a>
      <p>E ingresa el codigo:<b> ${user.token}</b></p>
      <p>este Token expira en 10 minutos</p>
      `,
    });
    console.log("mensaje enviado", info.messageId);
  };
}
