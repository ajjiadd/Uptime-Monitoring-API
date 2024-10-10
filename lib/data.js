/**
Title: Data file
Description: All the data is stored here
Author: AJ Jiad
Date: 21/09/2024
*/

//dependencies
const fs = require("fs");
const path = require("path");

//module scaffolding
const lib = {};

//base dir of the data folder
lib.baseDir = path.join(__dirname, "/../.data/");

//write to data file
lib.create = (dir, file, data, callback) => {
  // Check if the file already exists
  if (fs.existsSync(`${lib.baseDir + dir}/${file}.json`)) {
    callback("File already exists");
    return;
  }

  //open file for writing
  fs.open(`${lib.baseDir + dir}/${file}.json`, "wx", (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      //convert to string
      const stringData = JSON.stringify(data);

      //write data to file and then close it
      fs.writeFile(fileDescriptor, stringData, (err2) => {
        if (!err2) {
          fs.close(fileDescriptor, (err3) => {
            if (!err3) {
              callback(false);
            } else {
              callback("Error closing the new file!");
            }
          });
        } else {
          callback("Error writing to new file!");
        }
      });
    } else {
      callback("Error: file may already exist or another issue");
    }
  });
};

//read data from file
lib.read = (dir, file, callback) => {
  fs.readFile(`${lib.baseDir + dir}/${file}.json`, "utf8", (err, data) => {
    callback(err, data);
  });
};

//update existing file
lib.update = (dir, file, data, callback) => {
  fs.open(`${lib.baseDir + dir}/${file}.json`, "r+", (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      //convert the data to string
      const stringData = JSON.stringify(data);

      //truncate the file
      fs.ftruncate(fileDescriptor, (err1) => {
        if (!err1) {
          //write to the file and close it
          fs.writeFile(fileDescriptor, stringData, (err2) => {
            if (!err2) {
              //close the file
              fs.close(fileDescriptor, (err3) => {
                if (!err3) {
                  callback(false);
                } else {
                  callback("Error closing the file!");
                }
              });
            } else {
              callback("Error writing to file!");
            }
          });
        } else {
          callback("Error truncating file!");
        }
      });
    } else {
      callback("Error updating! File may not exist.");
    }
  });
};

//Delete existing file
lib.delete = (dir, file, callback) => {
  //unlink file
  fs.unlink(`${lib.baseDir + dir}/${file}.json`, (err) => {
    if (!err) {
      callback(false);
    } else {
      callback(`Error deleting file!`);
    }
  });
};

//list all the items in a directory
lib.list = (dir, callback) => {
  fs.readdir(`${lib.baseDir + dir}/`, (err, fileNames) => {
    if (!err && fileNames && fileNames.length > 0) {
      let trimmedFileNames = [];
      fileNames.forEach((fileName) => {
        trimmedFileNames.push(fileName.replace(".json", ""));
      });
      callback(false, trimmedFileNames);
    } else {
      callback("Error reading directory!");
    }
  });
};

//module exports
module.exports = lib;
