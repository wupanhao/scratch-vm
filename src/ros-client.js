const ROSLIB = require('roslib');
const ROS_NAMESPACE = '/ubiquityrobot/'

class ros_client {
  constructor(ros_base_ip, btnHandler = null) {
    this.url = 'ws://' + ros_base_ip + ':9090'
    if (window.location.protocol == 'https:') {
      this.url = 'wss://' + ros_base_ip + ':9443'
    }
    if (window.location.hostname == 'appassets.androidplatform.net') {
      this.url = 'ws://' + ros_base_ip + ':9090'
    }
    this.ip = ros_base_ip
    this.btnListener = null
    this.sensorStatusListener = null
    this.btnHandler = btnHandler
    this.sensorStatusHandler = null
    this.ros = null
    this.setSensorStatusHandler = this.setSensorStatusHandler.bind(this)
    // this.conectToRos()
  }

  conectToRos(onConnected, onFail) {
    console.log('trying to conect to ros server:')
    try {
      var ros = new ROSLIB.Ros({
        url: this.url
      });
    } catch (e) {
      console.log('ros client init error:', e)
      return
      console.log('trying to reconect after 3 seconds')
      setTimeout(() => {
        this.conectToRos(onConnected, onFail)
      }, 3000)
      return
    }
    if (this.btnListener != null) {
      this.btnListener.unsubscribe();
    }
    var btnListener = new ROSLIB.Topic({
      ros: ros,
      name: '/ubiquityrobot/pi_driver_node/button_event',
      messageType: 'pi_driver/ButtonEvent'
    });

    ros.on('connection', () => {
      console.log('Connected to websocket server.');
      if (this.btnHandler) {
        console.log('subscribe to button topic.');
        btnListener.subscribe(this.btnHandler);
      }
      if (onConnected) {
        onConnected()
      }

      this.msgTopic = new ROSLIB.Topic({
        ros: ros,
        name: ROS_NAMESPACE + 'pi_driver_node/new_message',
        messageType: 'std_msgs/String'
      });

    });

    ros.on('error', function (error) {
      console.log('Error connecting to websocket server: ', error);
      if (onFail) {
        onFail()
      }
    });

    ros.on('close', () => {
      console.log('Connection to websocket server closed.');
      // if (onFail) {
      //   onFail()
      // }
      return
      console.log('Connection to websocket server closed. retrying after 3 seconds');
      setTimeout(() => {
        this.conectToRos(callback)
      }, 3000)
    });

    this.ros = ros
    this.btnListener = btnListener
  }
  isConnected() {
    return this.ros && this.ros.isConnected
  }
  close() {
    this.ros.close()
  }

  setSensorStatusHandler(handler) {
    console.log('set sensorStatusHandler', handler)
    this.sensorStatusHandler = handler
  }

  subSensorStatusChange(callback) {
    if (this.sensorStatusListener != null) {
      this.sensorStatusListener.unsubscribe();
    }
    var sensorStatusListener = new ROSLIB.Topic({
      ros: this.ros,
      name: ROS_NAMESPACE + 'pi_driver_node/sensor_status_change',
      messageType: 'pi_driver/SensorStatusChange'
    });
    if (callback) {
      sensorStatusListener.subscribe(callback);
    }
    this.sensorStatusListener = sensorStatusListener
  }

  defaultSensorStatusHandler(message) {
    console.log(message, this.sensorStatusHandler)
    if (this.sensorStatusHandler) {
      console.log('this.sensorStatusHandler')
      this.sensorStatusHandler(message)
    }
  }
  motorSetType(port, value) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/motor_set_type',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({
        port: port,
        value: value
      });

      client.callService(request, (result) => {
        console.log(result)
        resolve()
      });
    })
  }
  motorSetState(port, value) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/motor_set_state',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({
        port: port,
        value: value
      });

      client.callService(request, (result) => {
        console.log(result)
        resolve()
      });
    })
  }

  motorSetEnable(port, value) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/motor_set_enable',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({
        port: port,
        value: value
      });

      client.callService(request, (result) => {
        console.log(result)
        resolve()
      });
    })
  }
  motorGetEncoder(port) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/motor_get_position',
        serviceType: 'pi_driver/GetInt32'
      });

      var request = new ROSLIB.ServiceRequest({
        port: port
      });

      client.callService(request, (result) => {
        console.log(result)
        resolve(result.value)
      });
    })
  }
  getMotorsInfo(port) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/motors_get_info',
        serviceType: 'pi_driver/GetMotorsInfo'
      });

      var request = new ROSLIB.ServiceRequest();

      client.callService(request, (result) => {
        // console.log(result)
        resolve(result.motors)
      });
    })
  }
  motorSetPulse(port, speed) {
    var topic = new ROSLIB.Topic({
      ros: this.ros,
      name: ROS_NAMESPACE + 'pi_driver_node/motor_set_pulse',
      messageType: 'pi_driver/U8Int32'
    });

    var msg = new ROSLIB.Message({
      port: port,
      value: speed
    });
    topic.publish(msg);
  }
  motorSetAngle(port, speed) {
    var topic = new ROSLIB.Topic({
      ros: this.ros,
      name: ROS_NAMESPACE + 'pi_driver_node/motor_set_angle',
      messageType: 'pi_driver/U8Int32'
    });

    var msg = new ROSLIB.Message({
      port: port,
      value: speed
    });
    topic.publish(msg);
  }

  motorSetSpeed(port, speed) {
    var topic = new ROSLIB.Topic({
      ros: this.ros,
      name: ROS_NAMESPACE + 'pi_driver_node/motor_set_speed',
      messageType: 'pi_driver/U8Int32'
    });

    var msg = new ROSLIB.Message({
      port: port,
      value: speed
    });
    topic.publish(msg);
    /*
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/motor_set_speed',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({
        port: port,
        value: speed
      });

      client.callService(request, (result) => {
        console.log(result)
        resolve()
      });
    })
    */
  }

  motorSetPosition(port, position) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/motor_set_position',
        serviceType: 'pi_driver/MotorSetPosition'
      });

      var request = new ROSLIB.ServiceRequest({
        port: port,
        value: position
      });

      client.callService(request, (result) => {
        console.log(result)
        resolve()
      });
    })
  }
  motorSetCurrentPosition(port, position) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/motor_set_current_position',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({
        port: port,
        value: position
      });

      client.callService(request, (result) => {
        console.log(result)
        resolve()
      });
    })
  }
  motorSetRotate(port, position) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/motor_set_rotate',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({
        port: port,
        value: position
      });

      client.callService(request, (result) => {
        console.log(result)
        resolve()
      });
    })
  }
  nineAxisSetEnable(value) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/9axes_set_enable',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({
        port: 0x46,
        value: value
      });

      client.callService(request, (result) => {
        console.log(result)
        resolve()
      });
    })
  }

  get3AxesData(id, offset = False) {
    let service
    if (offset) {
      service = ROS_NAMESPACE + 'pi_driver_node/sensor_get_3axes'
    } else {
      service = ROS_NAMESPACE + 'pi_driver_node/sensor_get_offset_3axes'
    }
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: service,
        serviceType: 'pi_driver/SensorGet3Axes'
      });

      var request = new ROSLIB.ServiceRequest({
        id: id
      });

      client.callService(request, (result) => {
        console.log(result)
        resolve(result)
      }, (error) => {
        console.log(error)
        resolve()
      });
    })
  }

  getSensorType(port) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/sensor_get_type',
        serviceType: 'pi_driver/GetInt32'
      });

      var request = new ROSLIB.ServiceRequest({
        port: port
      });

      client.callService(request, (result) => {
        // console.log(result)
        resolve(result.value)
      });
    })
  }
  getSensorMode(port) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/sensor_get_mode',
        serviceType: 'pi_driver/GetInt32'
      });

      var request = new ROSLIB.ServiceRequest({
        port: port
      });

      client.callService(request, (result) => {
        // console.log(result)
        resolve(result.value)
      });
    })
  }
  setSensorMode(port, value) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/sensor_set_mode',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({
        port: port,
        value: value
      });

      client.callService(request, (result) => {
        // console.log(result)
        resolve(result.value)
      });
    })
  }
  getSensorValue(port) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/sensor_get_value',
        serviceType: 'pi_driver/GetInt32'
      });

      var request = new ROSLIB.ServiceRequest({
        port: port
      });

      client.callService(request, (result) => {
        // console.log(result)
        resolve(result.value)
      });
    })
  }
  setSensorValue(port, value) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/sensor_set_value',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({
        port: port,
        value: value
      });

      client.callService(request, (result) => {
        console.log(result)
        resolve(result.value)
      });
    })
  }

  getSensorInfo(port) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/sensor_get_info',
        serviceType: 'pi_driver/GetSensorInfo'
      });

      var request = new ROSLIB.ServiceRequest({
        port: port
      });

      client.callService(request, (result) => {
        // console.log(result)
        resolve(result)
      });
    })
  }

  getPowerState() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/get_power_state',
        serviceType: 'pi_driver/GetPowerState'
      });

      var request = new ROSLIB.ServiceRequest();

      client.callService(request, (result) => {
        // console.log(result)
        resolve(result)
      });
    })
  }

  detectAprilTag() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'apriltag_detector_node/detect_apriltag',
        serviceType: 'pi_cam/GetApriltagDetections'
      });

      var request = new ROSLIB.ServiceRequest();

      client.callService(request, (result) => {
        console.log(result)
        resolve(result)
      });
    })
  }
  /*
    detectLanePose() {
      return new Promise((resolve) => {
        var client = new ROSLIB.Service({
          ros: this.ros,
          name: ROS_NAMESPACE + 'lane_detector_node/get_lane_pose',
          serviceType: 'duckietown_msgs/GetLanePose'
        });

        var request = new ROSLIB.ServiceRequest();

        client.callService(request, (result) => {
          console.log(result)

          resolve(result)
        });
      })
    }
  */
  cameraSetEnable(value, id = 0) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'camera_node/camera_set_enable',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({
        port: id,
        value: value
      });
      client.callService(request, (result) => {
        console.log(result)
        resolve()
      });
    })
  }

  cameraSetRectify(value, id = 0) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'camera_node/camera_set_rectify',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({
        port: id,
        value: value
      });
      client.callService(request, (result) => {
        console.log(result)
        resolve("设置成功")
      });
    })
  }

  cameraSetFlip(value, id = 0) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'camera_node/camera_set_flip',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({
        port: id,
        value: value
      });
      client.callService(request, (result) => {
        console.log(result)
        resolve("设置成功")
      });
    })
  }
  setNS(value) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'transfer_learning_node/set_ns',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: value
      });
      client.callService(request, (result) => {
        console.log(result)
        resolve(result.data)
      });
    })
  }
  createCat(value) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'transfer_learning_node/create_cat',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: value
      });
      client.callService(request, (result) => {
        console.log(result)
        resolve(result.data)
      });
    })
  }
  deleteNS(value) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'transfer_learning_node/delete_ns',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: value
      });
      client.callService(request, (result) => {
        console.log(result)
        resolve(result.data)
      });
    })
  }
  deleteCat(value) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'transfer_learning_node/delete_cat',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: value
      });
      client.callService(request, (result) => {
        console.log(result)
        resolve(result.data)
      });
    })
  }
  listNS() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'transfer_learning_node/list_ns',
        serviceType: 'pi_driver/GetStrings'
      });

      var request = new ROSLIB.ServiceRequest({ data: '' });
      client.callService(request, (result) => {
        console.log(result)
        resolve(result)
      });
    })
  }
  listCat() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'transfer_learning_node/list_cat',
        serviceType: 'pi_driver/GetStrings'
      });

      var request = new ROSLIB.ServiceRequest({ data: '' });
      client.callService(request, (result) => {
        console.log(result)
        resolve(result)
      });
    })
  }
  saveFrame(data) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'transfer_learning_node/camera_save_frame',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: data
      });
      client.callService(request, (result) => {
        console.log(result)
        resolve(result.data)
      });
    })
  }
  trainClassifier(data = '3') {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'transfer_learning_node/train_classifier',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: '' + data
      });
      console.log(request)
      client.callService(request, (result) => {
        console.log(result)
        resolve(result.data)
      });
    })
  }
  getPredictions() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'transfer_learning_node/predict',
        serviceType: 'pi_driver/GetPredictions'
      });

      var request = new ROSLIB.ServiceRequest();
      client.callService(request, (result) => {
        console.log(result)
        resolve(result)
      });
    })
  }
  getTrainingData() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'transfer_learning_node/get_training_data',
        serviceType: 'pi_driver/GetPredictions'
      });

      var request = new ROSLIB.ServiceRequest();
      client.callService(request, (result) => {
        console.log(result)
        resolve(result)
      });
    })
  }
  subTraningLogs(callback) {
    var listener = new ROSLIB.Topic({
      ros: this.ros,
      name: ROS_NAMESPACE + 'transfer_learning_node/training_logs',
      messageType: 'std_msgs/String'
    });

    listener.subscribe((message) => {
      console.log('Received message on ' + listener.name + ': ', message);
      if (callback) {
        callback(message)
      } else {
        console.log(message)
      }
    });
  }
  setTransferSize(w = 224, h = 224) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'transfer_learning_node/set_size',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({ port: w, value: h });
      client.callService(request, (result) => {
        console.log(result)
        resolve()
      });
    })
  }

  getFaceLabels() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'face_recognizer_node/list_face_labels',
        serviceType: 'pi_driver/GetStrings'
      });

      var request = new ROSLIB.ServiceRequest();
      client.callService(request, (result) => {
        console.log(result)
        resolve(result)
      });
    })
  }

  detectFaceLocations() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'face_recognizer_node/detect_face_locations',
        serviceType: 'pi_cam/GetFaceDetections'
      });

      var request = new ROSLIB.ServiceRequest();
      client.callService(request, (result) => {
        console.log(result)
        resolve(result)
      });
    })
  }
  detectFaceLabels() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'face_recognizer_node/detect_face_labels',
        serviceType: 'pi_cam/GetFaceDetections'
      });

      var request = new ROSLIB.ServiceRequest();
      client.callService(request, (result) => {
        console.log(result)
        resolve(result)
      });
    })
  }
  addFaceLabel(label) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'face_recognizer_node/add_face_label',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: label
      });
      client.callService(request, (result) => {
        console.log(result)
        resolve(result.data)
      });
    })
  }

  removeFaceLabel(label) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'face_recognizer_node/remove_face_label',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: label
      });
      client.callService(request, (result) => {
        console.log(result)
        resolve(result.data)
      });
    })
  }

  detectColor(params) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'line_detector_node/detect_line',
        serviceType: 'pi_cam/GetLineDetection'
      });

      var request = new ROSLIB.ServiceRequest(params);
      client.callService(request, (result) => {
        console.log(result)
        resolve(result)
      });
    })
  }

  setColorThreshold(params) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'line_detector_node/set_color_threshold',
        serviceType: 'pi_cam/SetColorThreshold'
      });

      var request = new ROSLIB.ServiceRequest(params);
      client.callService(request, (result) => {
        console.log(result)
        resolve(result.res)
      });
    })
  }

  getColorThreshold(color) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'line_detector_node/get_color_threshold',
        serviceType: 'pi_cam/GetColorThreshold'
      });

      var request = new ROSLIB.ServiceRequest({
        color: color
      });
      client.callService(request, (result) => {
        console.log(result)
        resolve(result.res)
      });
    })
  }
  getColorList(params) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'line_detector_node/get_color_list',
        serviceType: 'pi_driver/GetStrings'
      });

      var request = new ROSLIB.ServiceRequest(params);
      client.callService(request, (result) => {
        console.log(result)
        resolve(result)
      });
    })
  }
  subLineDetection(callback) {
    var listener = new ROSLIB.Topic({
      ros: this.ros,
      name: ROS_NAMESPACE + 'line_detector_node/line_detection',
      messageType: 'pi_cam/LineDetection'
    });

    listener.subscribe((message) => {
      console.log('Received message on ' + listener.name + ': ', message);
      if (callback) {
        callback(message)
      } else {
        console.log(message)
      }
    });
  }

  getImageTopics() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'camera_node/get_image_topics',
        serviceType: 'pi_driver/GetStrings'
      });

      var request = new ROSLIB.ServiceRequest();
      client.callService(request, (result) => {
        console.log(result)
        resolve(result)
      });
    })
  }
  /*
  setPidEnable(enabled = 1, speed = 50, offset = 240, factor = 1.0) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'line_detector_node/pid_set_enable',
        serviceType: 'pi_driver/SetPid'
      });

      var request = new ROSLIB.ServiceRequest({
        enabled: enabled,
        speed: speed,
        offset: offset,
        factor: factor
      });
      client.callService(request, (result) => {
        console.log(result)
        resolve(result)
      });
    })
  }
  */
  subJoyState(callback) {
    var listener = new ROSLIB.Topic({
      ros: this.ros,
      name: ROS_NAMESPACE + 'joystick_node/joy_state',
      messageType: 'std_msgs/String'
    });

    listener.subscribe((message) => {
      // console.log('Received message on ' + listener.name + ': ', message);
      if (callback) {
        callback(message)
      } else {
        console.log(message)
      }
    });
  }
  getAliveNodes() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_master_node/get_alive_nodes',
        serviceType: 'pi_driver/GetStrings'
      });

      var request = new ROSLIB.ServiceRequest();
      client.callService(request, (result) => {
        console.log(result)
        resolve(result)
      });
    })
  }
  shutdownNode(node_name) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_master_node/shutdown_node',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: node_name
      });
      client.callService(request, (result) => {
        console.log(result)
        resolve(result.data)
      });
    })
  }
  launchNode(node_name) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_master_node/launch_node',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: node_name
      });
      client.callService(request, (result) => {
        console.log(result)
        resolve(result.data)
      });
    })
  }
  launchTerminal(value) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_master_node/launch_terminal',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({
        port: 0,
        value: value
      });
      console.log(client, request)
      client.callService(request, (result) => {
        console.log(result)
        resolve(result.value)
      });
    })
  }

  /*
  inputString(input) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/input_string',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: input
      });
      client.callService(request, (result) => {
        console.log(result)
        resolve(result.data)
      });
    })
  }
  */

  variableList() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/variable_list',
        serviceType: 'pi_driver/GetString'
      });

      var request = new ROSLIB.ServiceRequest({
      });
      client.callService(request, (result) => {
        console.log(result)
        resolve(result.data)
      });
    })
  }
  deleteVariable(data) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/delete_variable',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({ data });
      client.callService(request, (result) => {
        console.log(result)
        resolve(result.data)
      });
    })
  }
  getServosInfo(ids = []) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/servos_get_info',
        serviceType: 'pi_driver/GetServosInfo'
      });

      var request = new ROSLIB.ServiceRequest({
        ids: ids
      });
      // console.log(request)
      client.callService(request, (result) => {
        console.log(result)
        resolve(result.servos)
      });
    })
  }

  setServoPosition(id, position, ms = 0, speed = 0) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/servo_set_position',
        serviceType: 'pi_driver/SetServoPosition'
      });

      var request = new ROSLIB.ServiceRequest({
        id, position, ms, speed
      });
      console.log(request)
      client.callService(request, (result) => {
        console.log(result)
        resolve(result.status)
      });
    })
  }

  setServoParamU8(id, param_id, value) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/servo_set_u8',
        serviceType: 'pi_driver/SetServoParam'
      });

      var request = new ROSLIB.ServiceRequest({
        id, param_id, value
      });
      console.log(request)
      client.callService(request, (result) => {
        console.log(result)
        resolve(result.status)
      });
    })
  }
  setServoParamU16(id, param_id, value) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/servo_set_u16',
        serviceType: 'pi_driver/SetServoParam'
      });

      var request = new ROSLIB.ServiceRequest({
        id, param_id, value
      });
      console.log(request)
      client.callService(request, (result) => {
        console.log(result)
        resolve(result.status)
      });
    })
  }
  getServoParamU8(id, param_id, value) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/servo_get_u8',
        serviceType: 'pi_driver/SetServoParam'
      });

      var request = new ROSLIB.ServiceRequest({
        id, param_id, value
      });
      console.log(request)
      client.callService(request, (result) => {
        console.log(result)
        resolve(result.status)
      });
    })
  }
  getServoParamU16(id, param_id, value) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/servo_get_u16',
        serviceType: 'pi_driver/SetServoParam'
      });

      var request = new ROSLIB.ServiceRequest({
        id, param_id, value
      });
      console.log(request)
      client.callService(request, (result) => {
        console.log(result)
        resolve(result.status)
      });
    })
  }
  getSensorsInfo() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/sensors_get_info',
        serviceType: 'pi_driver/GetMotorsInfo'
      });

      var request = new ROSLIB.ServiceRequest();
      // console.log(request)
      client.callService(request, (result) => {
        console.log(result)
        resolve(result.motors)
      });
    })
  }
  getObjectDetections() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'object_detector_node/detect_object',
        serviceType: 'pi_cam/GetObjectDetections'
      });

      var request = new ROSLIB.ServiceRequest();
      // console.log(request)
      client.callService(request, (result) => {
        console.log(result)
        resolve(result)
      });
    })
  }
  setObjectDetectionThreshold(value) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'object_detector_node/set_threshold',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({ value: value });
      // console.log(request)
      client.callService(request, (result) => {
        resolve(result)
      });
    })
  }
  getImageClassify() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'image_classifier_node/class_image',
        serviceType: 'pi_cam/GetObjectDetections'
      });

      var request = new ROSLIB.ServiceRequest();
      // console.log(request)
      client.callService(request, (result) => {
        console.log(result)
        resolve(result)
      });
    })
  }
  setImageClassifyThreshold(value) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'image_classifier_node/set_threshold',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({ value: value });
      // console.log(request)
      client.callService(request, (result) => {
        resolve(result)
      });
    })
  }

  setClassifySize(w = 224, h = 224) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'image_classifier_node/set_size',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({ port: w, value: h });
      client.callService(request, (result) => {
        console.log(result)
        resolve()
      });
    })
  }
  getUltraFaceInference() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'face_recognizer_node/detect_face_locations',
        serviceType: 'pi_cam/GetFaceDetections'
      });

      var request = new ROSLIB.ServiceRequest();
      // console.log(request)
      client.callService(request, (result) => {
        console.log(result)
        resolve(result)
      });
    })
  }
  setUltraFaceThreshold(value) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'face_recognizer_node/set_threshold',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({ value: value });
      // console.log(request)
      client.callService(request, (result) => {
        resolve(result)
      });
    })
  }

  setUltraFaceResize(w = 240, h = 180) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'face_recognizer_node/set_resize',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({ port: w, value: h });
      client.callService(request, (result) => {
        console.log(result)
        resolve()
      });
    })
  }

  subCompressedImage(topic, callback) {
    var listener = new ROSLIB.Topic({
      ros: this.ros,
      name: topic,
      // name: '/ubiquityrobot/camera_node/image_raw/compressed',
      messageType: 'sensor_msgs/CompressedImage'
    });

    listener.subscribe(callback);
    this.imageListener = listener
    return listener
  }

  unsubCompressedImage() {
    if (this.imageListener) {
      try {
        this.imageListener.unsubscribe()
        this.imageListener = null
      } catch (error) {
        console.log(error)
      }
    }
  }

  listCaliFiles() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'camera_node/list_cali_file',
        serviceType: 'pi_driver/GetStrings'
      });

      var request = new ROSLIB.ServiceRequest({
      });
      client.callService(request, (result) => {
        console.log(result)
        resolve(result)
      });
    })
  }

  loadCaliFile(value) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'camera_node/load_cali_file',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: value
      });
      client.callService(request, (result) => {
        console.log(result)
        resolve(result.data)
      });
    })
  }

  recognizeText(lang = 'eng') {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'text_recognizer_node/detect_text',
        serviceType: 'pi_driver/GetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: lang
      });
      client.callService(request, (result) => {
        console.log(result)
        resolve(result)
      });
    })
  }

  setTextRoi(value) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'text_recognizer_node/set_roi',
        serviceType: 'pi_cam/SetRoi'
      });

      var request = new ROSLIB.ServiceRequest(value);
      client.callService(request, (result) => {
        console.log(result)
        resolve(result.data)
      });
    })
  }

  detectBarcode() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'barcode_scanner_node/barcode_scan',
        serviceType: 'pi_cam/GetObjectDetections'
      });

      var request = new ROSLIB.ServiceRequest();
      client.callService(request, (result) => {
        console.log(result)
        resolve(result)
      });
    })
  }
  getCompressedImage() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'camera_node/camera_get_compressed',
        serviceType: 'pi_cam/GetCompressedFrame'
      });

      var request = new ROSLIB.ServiceRequest();
      client.callService(request, (result) => {
        console.log(result)
        resolve(result)
      });
    })
  }
  publishImage(data) {
    var topic = new ROSLIB.Topic({
      ros: this.ros,
      name: ROS_NAMESPACE + 'camera_node/image_raw/compressed',
      messageType: 'sensor_msgs/CompressedImage'
    });
    // var data = canvas.toDataURL('image/jpeg');
    var msg = new ROSLIB.Message({
      format: "jpeg",
      data: data.replace("data:image/jpeg;base64,", "")
    });
    topic.publish(msg)
  }

  getTopicsForType(type) {
    return new Promise(resolve => {
      this.ros.getTopicsForType(type, (topics) => {
        resolve({ data: topics })
      }, (error) => {
        console.log(error)
        resolve({ data: [] })
      })
    })
  }

  getFirmwareVersion() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/get_firmware_version',
        serviceType: 'pi_driver/GetInt32'
      });

      var request = new ROSLIB.ServiceRequest();
      // console.log(request)
      client.callService(request, (result) => {
        resolve(result.value)
      });
    })
  }

  getHexapodOffsets() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'hexapod_driver_node/get_offsets',
        serviceType: 'hexapod_controller/GetOffsets'
      });

      var request = new ROSLIB.ServiceRequest({});

      client.callService(request, (result) => {
        console.log(result)
        resolve(result)
      });
    })
  }

  setHexapodOffsets(position) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'hexapod_driver_node/set_offsets',
        serviceType: 'hexapod_controller/SetOffsets'
      });

      var request = new ROSLIB.ServiceRequest({
        data: {
          position: position
        }
      });

      client.callService(request, (result) => {
        console.log(result)
        resolve(result)
      });
    })
  }

  pubJointStates(angles) {
    var topic = new ROSLIB.Topic({
      ros: this.ros,
      name: ROS_NAMESPACE + 'hexapod_controller_node/joint_states',
      messageType: 'sensor_msgs/JointState'
    });

    var msg = new ROSLIB.Message({
      position: angles.map(angle => angle / 180.0 * Math.PI)
    })

    console.log(angles, msg)

    topic.publish(msg)
  }

  pubJointAngles(angles) {
    var topic = new ROSLIB.Topic({
      ros: this.ros,
      name: ROS_NAMESPACE + 'hexapod_driver_node/joint_angles',
      messageType: 'sensor_msgs/JointState'
    });

    var msg = new ROSLIB.Message({
      position: angles
    })

    console.log(angles, msg)

    topic.publish(msg)
  }
  systemPoweroff() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/system_poweroff',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest();

      client.callService(request, (result) => {
        console.log(result)
        resolve()
      });
    })
  }
  getGravityAngle() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/sensor_gravity_angle',
        serviceType: 'pi_driver/SensorGet3Axes'
      });

      var request = new ROSLIB.ServiceRequest();

      client.callService(request, (result) => {
        console.log(result)
        resolve(result)
      }, (error) => {
        console.log(error)
        resolve()
      });
    })
  }

  estimatePose() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/sensor_estimate_pose',
        serviceType: 'pi_driver/SensorGet3Axes'
      });

      var request = new ROSLIB.ServiceRequest();

      client.callService(request, (result) => {
        console.log(result)
        resolve(result)
      }, (error) => {
        console.log(error)
        resolve()
      });
    })
  }

  getOffset(sensor_id) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/sensor_get_offset',
        serviceType: 'pi_driver/SensorGet3Axes'
      });

      var request = new ROSLIB.ServiceRequest({ id: sensor_id });

      client.callService(request, (result) => {
        console.log(result)
        resolve(JSON.stringify(result.data))
      }, (error) => {
        console.log(error)
        resolve()
      });
    })
  }

  setOffset(sensor_id, offset) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/sensor_set_offset',
        serviceType: 'pi_driver/SetOffset'
      });

      var request = new ROSLIB.ServiceRequest({ id: sensor_id, data: offset });

      client.callService(request, (result) => {
        console.log(result)
        resolve(JSON.stringify(result))
      }, (error) => {
        console.log(error)
        resolve()
      });
    })
  }

  addProc(name, args) {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'image_processor_node/add_proc',
        serviceType: 'pi_cam/AddProc'
      });

      var request = new ROSLIB.ServiceRequest({ name, args });

      client.callService(request, (result) => {
        console.log(result)
        resolve(JSON.stringify(result))
      }, (error) => {
        console.log(error)
        resolve()
      });
    })
  }
  execProc() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'image_processor_node/exec_proc',
        serviceType: 'pi_driver/GetString'
      });

      var request = new ROSLIB.ServiceRequest();

      client.callService(request, (result) => {
        console.log(result)
        resolve(JSON.stringify(result))
      }, (error) => {
        console.log(error)
        resolve()
      });
    })
  }

  ros2_call_service() {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var addTwoInts = new ROSLIB.Service({
        ros: this.ros,
        name: 'add_two_ints',
        serviceType: 'example_interfaces/AddTwoInts'
      });

      var request = new ROSLIB.ServiceRequest({
        a: 1,
        b: 2
      });

      // Send the request
      addTwoInts.callService(request, (result) => {
        resolve()
        // document.getElementById("sum").innerText = result.sum;
        // console.log('Result for service call on ' + addTwoInts.name + ': ' + result.sum);
      }, (err) => {
        console.log(err)
      });
    })
  }

  publishMsg(msg) {
    let topic = new ROSLIB.Topic({
      ros: this.ros,
      name: '/ubiquityrobot/pi_driver_node/button_event',
      messageType: 'pi_driver/ButtonEvent'
    });
    topic.publish(msg)
  }

  TTSOffline(param) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/smart_audio_node/tts_offline',
        serviceType: 'pi_driver/GetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: param
      });

      // Send the request
      service.callService(request, (result) => {
        resolve()
      }, (err) => {
        console.log(err)
      });
    })
  }

  detectCommand(param) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/smart_audio_node/detect_command',
        serviceType: 'pi_driver/GetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: param
      });

      // Send the request
      service.callService(request, (result) => {
        resolve(result)
      }, (err) => {
        console.log(err)
      });
    })
  }

  toggleHotwordDetect(param) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/smart_audio_node/toggle_hotword_detect',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: param
      });

      // Send the request
      service.callService(request, (result) => {
        resolve(result.data)
      }, (err) => {
        console.log(err)
      });
    })
  }
  subHotwordDetect(callback) {
    let topic = new ROSLIB.Topic({
      ros: this.ros,
      name: '/ubiquityrobot/smart_audio_node/hotword_detect',
      messageType: 'std_msgs/String'
    });
    topic.subscribe(callback)
  }
  switchHotwordModel(file_name) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/smart_audio_node/switch_hotword_model',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: file_name
      });

      // Send the request
      service.callService(request, (result) => {
        resolve(result.data)
      }, (err) => {
        console.log(err)
      });
    })
  }
  subSensorValueChange(callback) {
    let topic = new ROSLIB.Topic({
      ros: this.ros,
      name: '/ubiquityrobot/pi_driver_node/sensor_value_change',
      messageType: 'pi_driver/SensorValueChange'
    });
    topic.subscribe(callback)
  }

  subNineAxisValueChange(callback) {
    let topic = new ROSLIB.Topic({
      ros: this.ros,
      name: '/ubiquityrobot/pi_driver_node/nine_axis_value_change',
      messageType: 'pi_driver/NineAxisValueChange'
    });
    topic.subscribe(callback)
  }

  setUpdateFrequence(param) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/pi_driver_node/set_update_frequence',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({
        value: param
      });

      // Send the request
      service.callService(request, (result) => {
        resolve()
        console.log(result)
      }, (err) => {
        console.log(err)
      });
    })
  }

  setNineAxisUpdateFrequence(param) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/pi_driver_node/set_nine_axis_update_frequence',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({
        value: param
      });

      // Send the request
      service.callService(request, (result) => {
        resolve()
        console.log(result)
      }, (err) => {
        console.log(err)
      });
    })
  }

  setPupperCommand(param) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/pupper_driver_node/set_command',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: param
      });

      // Send the request
      service.callService(request, (result) => {
        resolve()
        console.log(result)
      }, (err) => {
        console.log(err)
      });
    })
  }

  getPupperState() {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/pupper_driver_node/get_state',
        serviceType: 'pi_driver/GetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: ''
      });

      // Send the request
      service.callService(request, (result) => {
        resolve(result.data)
        console.log(result)
      }, (err) => {
        console.log(err)
      });
    })
  }

  setPupperServoAngles(param) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/pupper_driver_node/set_servo_angles',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: param
      });

      // Send the request
      service.callService(request, (result) => {
        resolve()
        console.log(result)
      }, (err) => {
        console.log(err)
      });
    })
  }

  setPupperFootLocations(param) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/pupper_driver_node/set_foot_locations',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: param
      });

      // Send the request
      service.callService(request, (result) => {
        resolve()
        console.log(result)
      }, (err) => {
        console.log(err)
      });
    })
  }

  setHexapodCommand(param) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/hexapod_driver_node/set_command',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: param
      });

      // Send the request
      service.callService(request, (result) => {
        resolve()
        console.log(result)
      }, (err) => {
        console.log(err)
      });
    })
  }

  getHexapodState() {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/hexapod_driver_node/get_state',
        serviceType: 'pi_driver/GetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: ''
      });

      // Send the request
      service.callService(request, (result) => {
        resolve(result.data)
        console.log(result)
      }, (err) => {
        console.log(err)
      });
    })
  }

  setHexapodServoAngles(param) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/hexapod_driver_node/set_servo_angles',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: param
      });

      // Send the request
      service.callService(request, (result) => {
        resolve()
        console.log(result)
      }, (err) => {
        console.log(err)
      });
    })
  }

  setHexapodFootLocations(param) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/hexapod_driver_node/set_foot_locations',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: param
      });

      // Send the request
      service.callService(request, (result) => {
        resolve()
        console.log(result)
      }, (err) => {
        console.log(err)
      });
    })
  }
  setCameraUpdateFrequence(param) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/camera_node/set_update_frequence',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({
        value: param
      });

      // Send the request
      service.callService(request, (result) => {
        resolve()
        console.log(result)
      }, (err) => {
        console.log(err)
      });
    })
  }

  setSystemLed(param) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/pi_driver_node/system_set_led',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({
        port: 0x07,
        value: param
      });

      // Send the request
      service.callService(request, (result) => {
        resolve()
        console.log(result)
      }, (err) => {
        console.log(err)
      });
    })
  }
  setSystemFanTemp(param) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/pi_driver_node/system_set_fan_temp',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({
        value: param.temp1, // High
        port: param.temp2 // Low
      });

      // Send the request
      service.callService(request, (result) => {
        resolve('设置成功')
        console.log(result)
      }, (err) => {
        console.log(err)
      });
    })
  }
  houghCircles(param) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/image_processor_node/hough_circles',
        serviceType: 'pi_driver/GetString'
      });

      var request = new ROSLIB.ServiceRequest({
        data: param
      });

      // Send the request
      service.callService(request, (result) => {
        resolve(result.data)
        console.log(result)
      }, (err) => {
        console.log(err)
      });
    })
  }
  detectHand() {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/hand_detector_node/detect_hand',
        serviceType: 'pi_driver/GetString'
      });

      var request = new ROSLIB.ServiceRequest({});

      // Send the request
      service.callService(request, (result) => {
        resolve(result.data)
        console.log(result)
      }, (err) => {
        console.log(err)
      });
    })
  }
  detectPose() {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/pose_estimator_node/detect_pose',
        serviceType: 'pi_driver/GetString'
      });

      var request = new ROSLIB.ServiceRequest({});

      // Send the request
      service.callService(request, (result) => {
        resolve(result.data)
        console.log(result)
      }, (err) => {
        console.log(err)
      });
    })
  }
  detectPoseNet() {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/movenet_pose_node/detect_pose',
        serviceType: 'pi_driver/GetString'
      });

      var request = new ROSLIB.ServiceRequest({});

      // Send the request
      service.callService(request, (result) => {
        resolve(result.data)
        console.log(result)
      }, (err) => {
        console.log(err)
      });
    })
  }
  detectFaceMesh() {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/face_recognizer_node/detect_face_mesh',
        serviceType: 'pi_driver/GetFaceMesh'
      });

      var request = new ROSLIB.ServiceRequest({});

      // Send the request
      service.callService(request, (result) => {
        resolve(result.landmarks)
        console.log(result)
      }, (err) => {
        console.log(err)
      });
    })
  }
  setBalanceCarThrottle(value) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/brushless_driver_node/set_throttle',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({ value });

      // Send the request
      service.callService(request, (result) => {
        resolve(result.value)
        console.log(result)
      }, (err) => {
        console.log(err)
      });
    })
  }

  setBalanceCarSteering(value) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/brushless_driver_node/set_steering',
        serviceType: 'pi_driver/SetInt32'
      });

      var request = new ROSLIB.ServiceRequest({ value });

      // Send the request
      service.callService(request, (result) => {
        resolve(result.value)
        console.log(result)
      }, (err) => {
        console.log(err)
      });
    })
  }


  getPowerMeas() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/system_get_power_meas',
        serviceType: 'pi_driver/SensorGet3Axes'
      });

      var request = new ROSLIB.ServiceRequest();

      client.callService(request, (result) => {
        // console.log(result)
        resolve(result)
      }, (error) => {
        console.log(error)
        resolve()
      });
    })
  }
  getVout1() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/system_get_vout1',
        serviceType: 'pi_driver/SensorGet3Axes'
      });

      var request = new ROSLIB.ServiceRequest();

      client.callService(request, (result) => {
        // console.log(result)
        resolve(result)
      }, (error) => {
        console.log(error)
        resolve()
      });
    })
  }
  getVout2() {
    return new Promise((resolve) => {
      var client = new ROSLIB.Service({
        ros: this.ros,
        name: ROS_NAMESPACE + 'pi_driver_node/system_get_vout2',
        serviceType: 'pi_driver/SensorGet3Axes'
      });

      var request = new ROSLIB.ServiceRequest();

      client.callService(request, (result) => {
        // console.log(result)
        resolve(result)
      }, (error) => {
        console.log(error)
        resolve()
      });
    })
  }

  async stopAll() {
    await this.motorSetSpeed(0, 0)
  }

  setMotorValue(value) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/brushless_driver_node/set_motor_value',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({ data: value });

      // Send the request
      service.callService(request, (result) => {
        resolve()
        console.log(result.data)
      }, (err) => {
        console.log(err)
      });
    })
  }

  getMotorState(value) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/brushless_driver_node/get_motor_state',
        serviceType: 'pi_driver/GetString'
      });

      var request = new ROSLIB.ServiceRequest({ data: value });

      // Send the request
      service.callService(request, (result) => {
        console.log(result)
        resolve(result.data)
      }, (err) => {
        console.log(err)
      });
    })
  }

  toggleBalanceCar(value) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/brushless_driver_node/set_balance_car',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({ data: value });

      // Send the request
      service.callService(request, (result) => {
        console.log(result)
        resolve()
      }, (err) => {
        console.log(err)
      });
    })
  }

  openWebCamera(value) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/camera_node/open_web_camera',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({ data: value });

      // Send the request
      service.callService(request, (result) => {
        console.log(result)
        resolve()
      }, (err) => {
        console.log(err)
      });
    })
  }

  subRemoteCamera(value) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/camera_node/sub_remote_camera',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({ data: value });

      // Send the request
      service.callService(request, (result) => {
        console.log(result)
        resolve()
      }, (err) => {
        console.log(err)
      });
    })
  }

  detectNfcId() {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/rfid_node/read_nfc_id',
        serviceType: 'pi_driver/GetString'
      });

      var request = new ROSLIB.ServiceRequest();

      // Send the request
      service.callService(request, (result) => {
        console.log(result)
        resolve(result)
      }, (err) => {
        console.log(err)
      });
    })
  }
  readBlockData(data) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/rfid_node/read_block_data',
        serviceType: 'pi_driver/GetString'
      });

      var request = new ROSLIB.ServiceRequest({ data });

      // Send the request
      service.callService(request, (result) => {
        console.log(result)
        resolve(result)
      }, (err) => {
        console.log(err)
      });
    })
  }
  writeBlockData(data) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/rfid_node/write_block_data',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({ data });

      // Send the request
      service.callService(request, (result) => {
        console.log(result)
        resolve(result)
      }, (err) => {
        console.log(err)
      });
    })
  }
  writeBytesData(data) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/rfid_node/write_block_bytes',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({ data });

      // Send the request
      service.callService(request, (result) => {
        console.log(result)
        resolve(result)
      }, (err) => {
        console.log(err)
      });
    })
  }
  saveFileData(name, data, dir = '') {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/pi_driver_node/save_file_data',
        serviceType: 'pi_driver/SaveFileData'
      });

      var request = new ROSLIB.ServiceRequest({ name, data, dir });

      // Send the request
      service.callService(request, (result) => {
        console.log(result)
        resolve(result.data)
      }, (err) => {
        console.log(err)
      });
    })
  }
  getFileData(path) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/pi_driver_node/get_file_data',
        serviceType: 'pi_driver/GetFileData'
      });

      var request = new ROSLIB.ServiceRequest({ path });

      // Send the request
      service.callService(request, (result) => {
        console.log(result)
        resolve(result.data)
      }, (err) => {
        console.log(err)
      });
    })
  }
  getFileList(path) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/pi_driver_node/get_file_list',
        serviceType: 'pi_driver/GetFileList'
      });

      var request = new ROSLIB.ServiceRequest({ path });

      // Send the request
      service.callService(request, (result) => {
        console.log(result)
        resolve(result)
      }, (err) => {
        console.log(err)
      });
    })
  }
  getNodeList() {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/pi_driver_node/get_node_list',
        serviceType: 'pi_driver/GetString'
      });

      var request = new ROSLIB.ServiceRequest({});

      // Send the request
      service.callService(request, (result) => {
        console.log(result)
        resolve(JSON.parse(result.data))
      }, (err) => {
        console.log(err)
      });
    })
  }
  startNode(data) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/pi_driver_node/start_node',
        serviceType: 'pi_driver/GetString'
      });

      var request = new ROSLIB.ServiceRequest({ data });

      // Send the request
      service.callService(request, (result) => {
        console.log(result)
        resolve(result.data)
      }, (err) => {
        console.log(err)
      });
    })
  }

  stopNode(data) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/pi_driver_node/stop_node',
        serviceType: 'pi_driver/GetString'
      });

      var request = new ROSLIB.ServiceRequest({ data });

      // Send the request
      service.callService(request, (result) => {
        console.log(result)
        resolve(result.data)
      }, (err) => {
        console.log(err)
      });
    })
  }
  proxyGet(data) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/pi_driver_node/proxy_get',
        serviceType: 'pi_driver/GetString'
      });

      var request = new ROSLIB.ServiceRequest({ data });

      // Send the request
      service.callService(request, (result) => {
        console.log(result)
        resolve(result.data)
      }, (err) => {
        console.log(err)
      });
    })
  }
  proxyPost(url, method, data) {
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/pi_driver_node/proxy_post',
        serviceType: 'pi_driver/ProxyPost'
      });

      var request = new ROSLIB.ServiceRequest({ url, method, data: data || '{}' });

      // Send the request
      service.callService(request, (result) => {
        console.log(result)
        resolve(result.data)
      }, (err) => {
        console.log(err)
      });
    })
  }
  subNewMessage(callback) {
    var msgListener = new ROSLIB.Topic({
      ros: this.ros,
      name: '/ubiquityrobot/pi_driver_node/new_message',
      messageType: 'std_msgs/String'
    });
    msgListener.subscribe(callback)
  }
  async sendMsgTo(host, msg) {
    let url = `http://${host}:8000/variable/message`
    try {
      await this.proxyPost(encodeURI(url), 'POST', JSON.stringify({ to: host, msg: msg }))
      let message = new ROSLIB.Message({
        data: JSON.stringify({ from: 'localhost', to: host, msg: msg })
      });
      this.msgTopic.publish(message)
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }

  subAudioTopic(callback){
    var msgListener = new ROSLIB.Topic({
      ros: this.ros,
      name: '/ubiquityrobot/pi_driver_node/audio_buffer',
      messageType: 'pi_driver/AudioBuffer'
    });
    msgListener.subscribe(callback)
  }

  openMic(){
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/pi_driver_node/open_mic',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({});

      // Send the request
      service.callService(request, (result) => {
        console.log(result)
        resolve(result.data)
      }, (err) => {
        console.log(err)
      });
    })
  }


  closeMic(){
    return new Promise(resolve => {
      // Create a Service client with details of the service's name and service type.
      var service = new ROSLIB.Service({
        ros: this.ros,
        name: '/ubiquityrobot/pi_driver_node/close_mic',
        serviceType: 'pi_driver/SetString'
      });

      var request = new ROSLIB.ServiceRequest({});

      // Send the request
      service.callService(request, (result) => {
        console.log(result)
        resolve(result.data)
      }, (err) => {
        console.log(err)
      });
    })
  }
}

module.exports = ros_client
