const { tag: tagModel } = require("../models");

const getCountOfExistingTagsForPhoto = async (photoId) => {
  const tagsCount = await tagModel.count({ where: { photoId } });
  return tagsCount;
};

module.exports = { getCountOfExistingTagsForPhoto };
