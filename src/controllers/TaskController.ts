import { Request, Response } from "express";
import Task from "../models/Task";
import Project from "../models/Project";

export class TaskController {
  static createTask = async (req: Request, res: Response) => {
    try {
      const task = new Task(req.body);
      task.project = req.project.id;
      req.project.tasks.push(task.id);
      await Promise.allSettled([task.save(), req.project.save()]);
      res.send("tarea creada");
    } catch (error) {
      res.status(500).json({ error: "La Tarea no fue creada" });
    }
  };

  static getProjectTasks = async (req: Request, res: Response) => {
    try {
      const tasks = await Task.find({ project: req.project.id }).populate(
        "project"
      );
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Proyecto no encontrado" });
    }
  };
  static getTasksById = async (req: Request, res: Response) => {
    try {
      const task = await Task.findById(req.task.id)
        .populate({
          path: "completedBy.user",
          select: "id name email",
        })
        .populate({
          path: "notes",
          populate: { path: "createdBy", select: "id name email" },
        });
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Tarea no encontrada" });
    }
  };
  static updateTask = async (req: Request, res: Response) => {
    try {
      req.task.name = req.body.name;
      req.task.description = req.body.description;
      await req.task.save();
      res.send("Tarea Actualizada Correctamente");
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "No se pudo actualizar la tarea" });
    }
  };

  static deleteTask = async (req: Request, res: Response) => {
    try {
      req.project.tasks = req.project.tasks.filter(
        (task) => task.toString() !== req.task.id.toString()
      );
      await Promise.allSettled([req.task.deleteOne(), req.project.save()]);
      res.send("Tarea Eliminada Correctamente");
    } catch (error) {
      res.status(500).json({ error: "no se pudo eliminar la tarea" });
    }
  };
  static updateStatus = async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const data = {
        user: req.user.id,
        status: status,
      };
      req.task.status = status;
      req.task.completedBy.push(data);
      await req.task.save();
      res.send("Tarea Actualizada Correctamente");
    } catch (error) {
      res.status(500).json({ error: "no se pudo actualizar el estatus" });
    }
  };
}
