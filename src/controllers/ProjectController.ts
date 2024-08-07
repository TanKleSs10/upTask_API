import { Request, Response } from "express";
import Project from "../models/Project";

export class ProjectController {
  static createProject = async (req: Request, res: Response) => {
    const project = new Project(req.body);
    // Asignar un manager
    project.manager = req.user.id;

    try {
      await project.save();
      res.send("Proyecto creado correctamenete");
    } catch (error) {
      console.log(error);
    }
  };
  static getAllProject = async (req: Request, res: Response) => {
    try {
      const projects = await Project.find({
        $or: [
          { manager: { $in: req.user.id } },
          { team: { $in: req.user.id } },
        ],
      });
      res.json(projects);
    } catch (error) {
      console.log(error);
    }
  };
  static getProjectById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const project = await Project.findById(id).populate("tasks");
      if (!project) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({ error: error.message });
      }
      if (
        (project.manager, this.toString() !== req.user.id.toString()) &&
        !project.team.includes(req.user.id)
      ) {
        const error = new Error("Acción no valida");
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "hubo un error estas aqui" });
    }
  };

  static updateProject = async (req: Request, res: Response) => {
    try {
      req.project.projectName = req.body.projectName;
      req.project.clientName = req.body.clientName;
      req.project.description = req.body.description;
      await req.project.save();
      res.send("Proyecto Actualizado Correctamente");
    } catch (error) {
      console.log(error);
    }
  };

  static delteProject = async (req: Request, res: Response) => {
    try {
      await req.project.deleteOne();
      res.send("Proyecto Eliminado Correctamente");
    } catch (error) {
      console.log(error);
    }
  };
}
