import { Router } from "express";
import { body, param } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post(
  "/create-account",
  body("name").notEmpty().withMessage("El nombre es obligatorio"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña es muy corta, minimo 8 caracteres"),
  body("password_confirm").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Las contraseñas son diferentes");
    }
    return true;
  }),
  body("email").isEmail().withMessage("Email no valido"),
  handleInputErrors,
  AuthController.createAccount
);

router.post(
  "/confirm-account",
  body("token").notEmpty().withMessage("El Token no puede ir vacio"),
  handleInputErrors,
  AuthController.confirmAccount
);
router.post(
  "/login",
  body("email").isEmail().withMessage("Email no valido"),
  body("password").notEmpty().withMessage("La contraseña no puede esta vacia"),
  handleInputErrors,
  AuthController.login
);
router.post(
  "/request-code",
  body("email").isEmail().withMessage("Email no valido"),
  handleInputErrors,
  AuthController.requestConfirmationCode
);
router.post(
  "/forgot-password",
  body("email").isEmail().withMessage("Email no valido"),
  handleInputErrors,
  AuthController.forgotPassword
);
router.post(
  "/validate-token",
  body("token").notEmpty().withMessage("El Token no puede ir vacio"),
  handleInputErrors,
  AuthController.validateToken
);
router.post(
  "/update-password/:token",
  param("token").isNumeric().withMessage("Token no valido"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña es muy corta, minimo 8 caracteres"),
  body("password_confirm").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Las contraseñas son diferentes");
    }
    return true;
  }),
  handleInputErrors,
  AuthController.updatePasswordWithToken
);

router.get("/user", authenticate, AuthController.user);

//* Profile
router.put(
  "/profile",
  authenticate,
  body("name").notEmpty().withMessage("El nombre es obligatorio"),
  body("email").isEmail().withMessage("Email no valido"),
  handleInputErrors,
  AuthController.updateProfile
);
router.post(
  "/update-password",
  authenticate,
  body("current_password")
    .notEmpty()
    .withMessage("La contraseña actual no puede estar vacía"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña es muy corta, minimo 8 caracteres"),
  body("password_confirm").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Las contraseñas son diferentes");
    }
    return true;
  }),
  handleInputErrors,
  AuthController.updateCurrentUserPassword
);

router.post(
  "/check-password",
  authenticate,
  body("password").notEmpty().withMessage("La contraseña no puede estar vacía"),
  handleInputErrors,
  AuthController.checkPassword
);

export default router;
