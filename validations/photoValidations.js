const validateImageUrl = (imageUrl) => {
  return imageUrl.startsWith("<https://images.unsplash.com/");
};

const validateSingleTag = (tag) => {
  return tag !== "" && tag.length <= 20;
};

const validateImageTags = (tags) => {
  const errors = [];
  if (tags.length > 5) {
    errors.push("There shouldn't be more than 5 tags for one photo");
  }

  for (const tag of tags) {
    if (tag === "") {
      errors.push("Tags must be non-empty strings.");
      break;
    }
    if (tag.length > 20) {
      errors.push("Tags shouldn't exceed 20 characters in length.");
      break;
    }
  }

  return errors;
};

const validateSortQuery = (sortQuery) => {
  return sortQuery === "ASC" || sortQuery === "DESC";
};

module.exports = {
  validateImageUrl,
  validateImageTags,
  validateSortQuery,
  validateSingleTag,
};
