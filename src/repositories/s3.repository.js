const AWS = require('aws-sdk');
const { config } = require('../config');

let s3Config = { apiVersion: '2006-03-01' };

if (config.env && config.env === 'local') {
  s3Config.endpoint = 'http://localstack:4572/';
  s3Config.s3ForcePathStyle = 'true';
}

const s3 = new AWS.S3(s3Config);

class S3Repository {
  /**
   *
   * @param {*} file
   * @param {*} filename
   * @param {*} bucket Bucket name
   */
  static put(file, filename, bucket) {
    const params = {
      Bucket: bucket,
      Key: filename,
      Body: file.buffer
    };
    const options = {};

    return new Promise(function(resolve, reject) {
      s3.upload(params, options, function(err, data) {
        if (err !== null) reject(err);
        else resolve(data);
      });
    });
  }

  /**
   *
   * @param {*} filename
   * @param {*} bucket Bucket name
   */
  static delete(filename, bucket) {
    const params = {
      Bucket: bucket,
      Key: filename
    };

    return s3.deleteObject(params);
  }
}

module.exports = S3Repository;
