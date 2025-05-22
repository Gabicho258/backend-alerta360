import express from "express";

import { IncidentController } from "../controllers/index.js";

const {
  createIncident,
  getAllIncidents,
  updateIncident,
  deleteIncident,
  getOneIncident,
} = IncidentController;

const router = express.Router();

const INCIDENT_ROUTES = {
  GET_ALL: "/incident",
  GET_ONE: "/incident/:id",
  CREATE: "/incident/create",
  UPDATE: "/incident/update/:id",
  DELETE: "/incident/delete/:id",
};

router.get(INCIDENT_ROUTES.GET_ALL, getAllIncidents);
router.get(INCIDENT_ROUTES.GET_ONE, getOneIncident);
router.put(INCIDENT_ROUTES.UPDATE, updateIncident);
router.post(INCIDENT_ROUTES.CREATE, /*isAuthenticated*/ createIncident);
router.delete(INCIDENT_ROUTES.DELETE, deleteIncident);

export default router;
