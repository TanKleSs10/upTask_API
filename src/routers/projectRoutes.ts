import { Router } from "express";
import { body, param } from "express-validator";
import { ProjectController } from "../controllers/ProjectController";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskController";
import { projectExists } from "../middleware/project";
import {
  hasAuthorization,
  taskBelongstoProject,
  taskExists,
} from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamMemberController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";

const router = Router();

router.use(authenticate);
// create
router.post(
  "/",
  body("projectName")
    .notEmpty()
    .withMessage("El nombre del proyecto es obligatorio"),
  body("clientName")
    .notEmpty()
    .withMessage("El nombre del cliente es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripción del proyecto es Obligatoria"),
  handleInputErrors,
  ProjectController.createProject
);

// Read
router.get("/", ProjectController.getAllProject);

router.get(
  "/:id",
  param("id").isMongoId().withMessage("Id no valido"),
  handleInputErrors,
  ProjectController.getProjectById
);

// agrega el middleware que queremos utilizar cuando tenga un parametro especifico
router.param("projectId", projectExists);

router.put(
  "/:projectId",
  param("projectId").isMongoId().withMessage("Id no valido"),
  body("projectName")
    .notEmpty()
    .withMessage("El nombre del proyecto es obligatorio"),
  body("clientName")
    .notEmpty()
    .withMessage("El nombre del cliente es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripción del proyecto es Obligatoria"),
  handleInputErrors,
  hasAuthorization,
  ProjectController.updateProject
);
router.delete(
  "/:projectId",
  param("projectId").isMongoId().withMessage("Id no valido"),
  handleInputErrors,
  hasAuthorization,
  ProjectController.delteProject
);

//  Roters for task

router.post(
  "/:projectId/tasks",
  body("name").notEmpty().withMessage("El nombre del proyecto es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripción de la tarea es obligatoria"),
  handleInputErrors,
  hasAuthorization,
  TaskController.createTask
);

router.get("/:projectId/tasks", TaskController.getProjectTasks);

router.param("taskId", taskExists);
router.param("taskId", taskBelongstoProject);

router.get(
  "/:projectId/tasks/:taskId",
  param("taskId").isMongoId().withMessage("Id no valido"),
  handleInputErrors,
  TaskController.getTasksById
);
router.put(
  "/:projectId/tasks/:taskId",
  param("taskId").isMongoId().withMessage("Id no valido"),
  body("name").notEmpty().withMessage("El nombre del proyecto es obligatorio"),
  body("description")
    .notEmpty()
    .withMessage("La descripción de la tarea es obligatoria"),
  handleInputErrors,
  hasAuthorization,
  TaskController.updateTask
);

router.delete(
  "/:projectId/tasks/:taskId",
  param("taskId").isMongoId().withMessage("Id no valido"),
  handleInputErrors,
  hasAuthorization,
  TaskController.deleteTask
);

router.post(
  "/:projectId/tasks/:taskId/status",
  param("taskId").isMongoId().withMessage("Id no valido"),
  body("status").notEmpty().withMessage("El estado es obligatorio"),
  handleInputErrors,
  TaskController.updateStatus
);

// * Routes for teams
router.post(
  "/:projectId/team/find",
  body("email").isEmail().toLowerCase().withMessage("Email no válido"),
  handleInputErrors,
  TeamMemberController.findMemmberEmail
);
router.post(
  "/:projectId/team",
  body("id").isMongoId().withMessage("ID no valido"),
  handleInputErrors,
  TeamMemberController.addMemberById
);

router.get("/:projectId/team", TeamMemberController.getProjectTeam);

router.delete(
  "/:projectId/team/:userId",
  param("userId").isMongoId().withMessage("ID no valido"),
  handleInputErrors,
  TeamMemberController.removeMemberById
);

// CRUD de las Notas

router.post(
  "/:projectId/task/:taskId/notes",
  body("content")
    .notEmpty()
    .withMessage("El contenido de la nota es obligatorio"),
  handleInputErrors,
  NoteController.createNote
);

router.get("/:projectId/task/:taskId/notes", NoteController.getTaskNotes);

router.delete(
  "/:projectId/task/:taskId/notes/:noteId",
  param("noteId").isMongoId().withMessage("ID no valido"),
  handleInputErrors,
  NoteController.deleteNote
);

export default router;
