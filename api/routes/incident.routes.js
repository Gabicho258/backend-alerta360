import express from "express";

import { IncidentController } from "../controllers/index.js";

const {
  createIncident,
  getAllIncidents,
  updateIncident,
  deleteIncident,
  getOneIncident,
  getIncidentsByUserId,
} = IncidentController;

const router = express.Router();

const INCIDENT_ROUTES = {
  // Sin /incident ya que se monta en /api/v1/incident
  GET_ALL: "/",
  GET_ONE: "/:id",
  CREATE: "/create",
  UPDATE: "/update/:id",
  DELETE: "/delete/:id",
  GET_BY_USER_ID: "/user/:id",
};

router.get(INCIDENT_ROUTES.GET_ALL, getAllIncidents);
router.get(INCIDENT_ROUTES.GET_ONE, getOneIncident);
router.put(INCIDENT_ROUTES.UPDATE, updateIncident);
router.post(INCIDENT_ROUTES.CREATE, /*isAuthenticated*/ createIncident);
router.delete(INCIDENT_ROUTES.DELETE, deleteIncident);
router.get(INCIDENT_ROUTES.GET_BY_USER_ID, getIncidentsByUserId);

export default router;
