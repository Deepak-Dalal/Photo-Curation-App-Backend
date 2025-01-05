const axiosInstance = require("../lib/axios.lib");
const {
  photo: photoModel,
  tag: tagModel,
  searchHistory: searchHistoryModel,
  user: userModel,
} = require("../models");
const { getCountOfExistingTagsForPhoto } = require("../services/photoService");
const {
  validateImageUrl,
  validateImageTags,
  validateSortQuery,
  validateSingleTag,
} = require("../validations/photoValidations");
const { Op } = require("@sequelize/core");

const searchImages = async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) {
      return res
        .status(400)
        .json({ error: "Search term is required as query param" });
    }

    if (!process.env.UNSPLASH_ACCESS_KEY) {
      return res.status(500).json({
        error:
          "Unsplash API key is not configured in the environment variables",
      });
    }
    const response = await axiosInstance.get(`/search/photos?query=${query}`);

    if (response.data.total === 0) {
      res.status(404).json({ error: "No images found for the given query" });
    } else {
      const photos = [];
      for (const result of response.data.results) {
        photos.push({
          imageUrl: result.urls.raw,
          description: result.description,
          altDescription: result.alt_description,
        });
      }
      res.status(200).json({ photos });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to search the images" });
  }
};

const saveImage = async (req, res) => {
  try {
    const { imageUrl, description, altDescription, tags, userId } = req.body;

    const isValidImageUrl = validateImageUrl(imageUrl);
    if (!isValidImageUrl) {
      return res.status(400).json({ error: "Invalid image URL" });
    }

    const tagErrors = validateImageTags(tags);
    if (tagErrors.length > 0) {
      return res.status(400).json({ errors: tagErrors });
    }

    const newPhoto = await photoModel.create({
      imageUrl,
      description,
      altDescription,
      dateSaved: new Date(),
      userId,
    });
    const tagObjectsToInsert = [];
    tags.forEach((tag) =>
      tagObjectsToInsert.push({ name: tag, photoId: newPhoto.id })
    );
    await tagModel.bulkCreate(tagObjectsToInsert);

    res.status(201).json({ message: "Photo saved successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to save the photo" });
  }
};

const addTagsToPhoto = async (req, res) => {
  try {
    const photoId = req.params.photoId;
    const tags = req.body.tags;

    const existingTagsCount = await getCountOfExistingTagsForPhoto(photoId);

    if (existingTagsCount + tags.length > 5) {
      return res
        .status(400)
        .json({ error: "Each photo can have a maximum of 5 tags" });
    }

    const tagErrors = validateImageTags(tags);
    if (tagErrors.length > 0) {
      return res.status(400).json({ errors: tagErrors });
    }
    const tagObjectsToInsert = [];
    tags.forEach((tag) => tagObjectsToInsert.push({ name: tag, photoId }));

    await tagModel.bulkCreate(tagObjectsToInsert);

    res.status(201).json({ message: "Tags added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to add tags to the photo" });
  }
};

const searchPhotosByTags = async (req, res) => {
  try {
    const { tags: tag, sort, userId } = req.query;
    let order = "ASC";
    if (sort) {
      order = sort;

      const isValidSortQuery = validateSortQuery(sort);
      if (!isValidSortQuery) {
        return res.status(400).json({ error: "Invalid sort query" });
      }
    }

    if (typeof tag !== "string" || !validateSingleTag(tag)) {
      return res.status(400).json({ error: "Invalid tag query" });
    }
    const tagsData = await tagModel.findAll({
      attributes: ["photoId"],
      where: { name: tag },
      raw: true,
    });

    if (tagsData.length == 0) {
      return res
        .status(404)
        .json({ error: "No record for the give tag found" });
    }
    const photoIds = tagsData.map((tagData) => tagData.photoId);

    const photos = await photoModel.findAll({
      where: { id: { [Op.in]: photoIds } },
      order: [["dateSaved", order]],
      raw: true,
    });
    const result = [];
    for (const photo of photos) {
      const tags = await tagModel.findAll({
        where: { photoId: photo.id },
        raw: true,
      });
      result.push({
        imageUrl: photo.imageUrl,
        description: photo.description,
        dateSaved: photo.dateSaved,
        tags: tags.map((tag) => tag.name),
      });
    }

    if (userId) {
      await searchHistoryModel.create({
        userId,
        query: tag,
      });
    }
    res.status(200).json({ photos: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to search photos" });
  }
};

const getSearchHistory = async (req, res) => {
  try {
    const userId = parseInt(req.query.userId);

    const userData = await userModel.findOne({
      where: { id: userId },
      raw: true,
    });
    if (!userData) {
      return res
        .status(404)
        .json({ error: "No user found with the given userId" });
    }

    const searchHistory = await searchHistoryModel.findAll({
      attributes: ["query", "timestamp"],
      where: { userId },
      raw: true,
    });
    if (searchHistory.length == 0) {
      return res
        .status(404)
        .json({ error: "search history not found for the given userId" });
    }
    res.status(200).json({ searchHistory });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to get search history" });
  }
};

module.exports = {
  searchImages,
  saveImage,
  addTagsToPhoto,
  searchPhotosByTags,
  getSearchHistory,
};
