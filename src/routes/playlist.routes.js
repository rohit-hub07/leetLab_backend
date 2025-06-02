import express from 'express'
import { isAuthenticated } from '../middleware/auth.middle.js';
import { createPlaylist, getAllListDetails, getPlaylistDetails,addProblemToPlaylist, deletePlaylist, removeProblemFromPlaylist } from '../controller/playlist.controller.js';

const playlistRoutes = express.Router();

playlistRoutes.get("/", isAuthenticated, getAllListDetails);

playlistRoutes.get("/:playlistId", isAuthenticated, getPlaylistDetails);

playlistRoutes.post("/create-playlist", isAuthenticated, createPlaylist);

playlistRoutes.post("/:playlistId/add-problem", isAuthenticated, addProblemToPlaylist);

playlistRoutes.delete("/:playlistId", isAuthenticated, deletePlaylist);

playlistRoutes.delete("/:playlistId/remove-problem", isAuthenticated, removeProblemFromPlaylist)

export default playlistRoutes;