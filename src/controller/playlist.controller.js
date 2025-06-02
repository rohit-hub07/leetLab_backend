import { db } from "../libs/db.js";

export const createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    const playlist = await db.playlist.create({
      data: {
        name,
        description,
        userId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Playlist create successfully",
      playlist,
    });
  } catch (error) {
    console.log("Error creating playlist", error);
    res.status(500).json({
      error: "Failed to create playlist",
    });
  }
};

export const getAllListDetails = async (req, res) => {
  try {
    const playlists = await db.playlist.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });
    console.log("PlaylistData", playlists);
    res.status(200).json({
      success: true,
      message: "Playlist fetched successfully",
      playlists,
    });
  } catch (error) {
    console.log("Error fetching playlist", error);
    res.status(500).json({
      error: "Failed to fetch playlist",
    });
  }
};

export const getPlaylistDetails = async (req, res) => {
  const { playlistId } = req.params;
  try {
    const playlist = await db.playlist.findUnique({
      where: {
        id: playlistId,
        userID: req.user.id,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });

    if (!playlist) {
      return res.status(404).json({
        error: "Playlist not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Playlist fetched successfully",
      playlist,
    });
  } catch (error) {
    console.log("Error fetching playlist : ", error);
    res.status(500).json({
      error: "Failed to fetch playlist",
    });
  }
};

export const addProblemToPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;
  try {
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({ error: "Invalid or missing problemId" });
    }
    //check if the problem already exist in the playlist
    const existingProblems = await db.problemInPlaylist.findMany({
      where: {
        playlistId: playlistId,
        problemId: {
          in: problemIds,
        },
      },
      include: {
          playlist: true,
        }
    });

    if (existingProblems.length > 0) {
      return res.status(409).json({
        success: false,
        error: "Problem already exist in the playlist!",
        Playlistname: existingProblems.map((p) => p.playlist.name),
      });
    }
    //create records for each problem in the playlists
    const problemsInPlaylist = await db.problemInPlaylist.createMany({
      data: problemIds.map((problemId) => ({
        playlistId: playlistId,
        problemId,
      })),
    });

    res.status(200).json({
      success: true,
      message: "Problem added to playlist successfully",
      problemsInPlaylist,
    });
  } catch (error) {
    console.log("Error adding problem in playlist: ", error.message);
    res.status(500).json({
      error: "Error adding problem in playlist",
    });
  }
};

export const deletePlaylist = async (req, res) => {
  const { playlistId } = req.params;
  try {
    const deletedPlaylist = await db.playlist.delete({
      where: {
        id: playlistId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Playlist deleted successfully",
      deletedPlaylist,
    });
  } catch (error) {
    console.log("Failed deleting playlist : ", error);
    res.status(500).json({ error: "Failed deleting playlist" });
  }
};

export const removeProblemFromPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;
  try {
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({ error: "Invalid or missing problemId" });
    }
    const deletedProblem = await db.problemInPlaylist.deleteMany({
      where: {
        playlistId,
        problemId: {
          in: problemIds,
        },
      },
    });
    res.status(200).json({
      success: true,
      message: "Problem deleted successfully from the playlist",
      deletedProblem,
    });
  } catch (error) {
    console.log("Error removing problem from the playlist: ", error);
    res.status(500).json({
      error: "Error removing problem from the playlist",
    });
  }
};
