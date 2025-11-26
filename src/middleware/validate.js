"use strict";

const validate = (schemas) => {
  return (req, res, next) => {
    const toValidate = ["body", "query", "params"];

    for (const key of toValidate) {
      if (schemas[key]) {
        const { error } = schemas[key].validate(req[key], {
          abortEarly: false,
          allowUnknown: true,
          stripUnknown: true,
        });

        if (error) {
          return res.status(400).json({
            success: false,
            message: "Validation error",
            details: error.details.map((d) => d.message),
          });
        }
      }
    }

    next();
  };
};

module.exports =  validate ;
