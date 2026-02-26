const userService = require('../services/user.service');

const list = async (req, res) => {
  try {
    const data = await userService.getAllUsers();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const data = await userService.updateUser(req.params.id, req.body, req.user.id);
    res.status(200).json({ success: true, message: "User updated", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// EXPORT HARUS BEGINI
module.exports = {
  list,
  update,
  remove
};