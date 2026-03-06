const {
  Face,
  Vector: { lerp },
  Utils: { clamp }
} = Kalidokit;

// update live2d model internal state
const rigFace = (currentModel, result, lerpAmount = 0.7) => {
  result = Object.assign({
    "eye": {
      "l": 1,
      "r": 1
    },
    "mouth": {
      "x": 0,
      "y": 0,
      "shape": {
        "A": 0,
        "E": 0,
        "I": 0,
        "O": 0,
        "U": 0
      }
    },
    "head": {
      "x": 0,
      "y": 0,
      "z": 0,
      "width": 0.3,
      "height": 0.6,
      "position": {
        "x": 0.5,
        "y": 0.5,
        "z": 0
      },
      "normalized": {
        "y": 0,
        "x": 0,
        "z": 0
      },
      "degrees": {
        "y": 0,
        "x": 0,
        "z": 0
      }
    },
    "brow": 0,
    "pupil": {
      "x": 0,
      "y": 0
    }
  }, result)
  let coreModel = currentModel.internalModel.coreModel
  if (!coreModel || !result) return;

  if (coreModel._parameterIds.indexOf("ParamEyeBallX") >= 0) {

    currentModel.internalModel.motionManager.update = (...args) => {
      // disable default blink animation
      currentModel.internalModel.eyeBlink = undefined;

      coreModel.setParameterValueById(
        "ParamEyeBallX",
        lerp(
          result.pupil.x,
          coreModel.getParameterValueById("ParamEyeBallX"),
          lerpAmount
        )
      );
      coreModel.setParameterValueById(
        "ParamEyeBallY",
        lerp(
          result.pupil.y,
          coreModel.getParameterValueById("ParamEyeBallY"),
          lerpAmount
        )
      );

      // X and Y axis rotations are swapped for Live2D parameters
      // because it is a 2D system and KalidoKit is a 3D system
      coreModel.setParameterValueById(
        "ParamAngleX",
        lerp(
          result.head.degrees.y,
          coreModel.getParameterValueById("ParamAngleX"),
          lerpAmount
        )
      );
      coreModel.setParameterValueById(
        "ParamAngleY",
        lerp(
          result.head.degrees.x,
          coreModel.getParameterValueById("ParamAngleY"),
          lerpAmount
        )
      );
      coreModel.setParameterValueById(
        "ParamAngleZ",
        lerp(
          result.head.degrees.z,
          coreModel.getParameterValueById("ParamAngleZ"),
          lerpAmount
        )
      );

      // update body params for models without head/body param sync
      const dampener = 0.3;
      coreModel.setParameterValueById(
        "ParamBodyAngleX",
        lerp(
          result.head.degrees.y * dampener,
          coreModel.getParameterValueById("ParamBodyAngleX"),
          lerpAmount
        )
      );
      coreModel.setParameterValueById(
        "ParamBodyAngleY",
        lerp(
          result.head.degrees.x * dampener,
          coreModel.getParameterValueById("ParamBodyAngleY"),
          lerpAmount
        )
      );
      coreModel.setParameterValueById(
        "ParamBodyAngleZ",
        lerp(
          result.head.degrees.z * dampener,
          coreModel.getParameterValueById("ParamBodyAngleZ"),
          lerpAmount
        )
      );

      // Simple example without winking.
      // Interpolate based on old blendshape, then stabilize blink with `Kalidokit` helper function.
      let stabilizedEyes = Kalidokit.Face.stabilizeBlink(
        {
          l: lerp(
            result.eye.l,
            coreModel.getParameterValueById("ParamEyeLOpen"),
            0.7
          ),
          r: lerp(
            result.eye.r,
            coreModel.getParameterValueById("ParamEyeROpen"),
            0.7
          )
        },
        result.head.y
      );
      // eye blink
      coreModel.setParameterValueById("ParamEyeLOpen", stabilizedEyes.l);
      coreModel.setParameterValueById("ParamEyeROpen", stabilizedEyes.r);

      // mouth
      coreModel.setParameterValueById(
        "ParamMouthOpenY",
        lerp(
          result.mouth.y,
          coreModel.getParameterValueById("ParamMouthOpenY"),
          0.3
        )
      );
      // Adding 0.3 to ParamMouthForm to make default more of a "smile"
      coreModel.setParameterValueById(
        "ParamMouthForm",
        0.3 +
        lerp(
          result.mouth.x,
          coreModel.getParameterValueById("ParamMouthForm"),
          0.3
        )
      );
    };
  } else {

    currentModel.internalModel.motionManager.update = (...args) => {
      // disable default blink animation
      currentModel.internalModel.eyeBlink = undefined;

      coreModel.setParameterValueById(
        "PARAM_EYE_BALL_X",
        lerp(
          result.pupil.x,
          coreModel.getParameterValueById("PARAM_EYE_BALL_X"),
          lerpAmount
        )
      );
      coreModel.setParameterValueById(
        "PARAM_EYE_BALL_Y",
        lerp(
          result.pupil.y,
          coreModel.getParameterValueById("PARAM_EYE_BALL_Y"),
          lerpAmount
        )
      );

      // X and Y axis rotations are swapped for Live2D parameters
      // because it is a 2D system and KalidoKit is a 3D system
      coreModel.setParameterValueById(
        "PARAM_ANGLE_X",
        lerp(
          result.head.degrees.y,
          coreModel.getParameterValueById("PARAM_ANGLE_X"),
          lerpAmount
        )
      );
      coreModel.setParameterValueById(
        "PARAM_ANGLE_Y",
        lerp(
          result.head.degrees.x,
          coreModel.getParameterValueById("PARAM_ANGLE_Y"),
          lerpAmount
        )
      );
      coreModel.setParameterValueById(
        "PARAM_ANGLE_Z",
        lerp(
          result.head.degrees.z,
          coreModel.getParameterValueById("PARAM_ANGLE_Z"),
          lerpAmount
        )
      );

      // update body params for models without head/body param sync
      const dampener = 0.3;
      coreModel.setParameterValueById(
        "PARAM_BODY_ANGLE_X",
        lerp(
          result.head.degrees.y * dampener,
          coreModel.getParameterValueById("PARAM_BODY_ANGLE_X"),
          lerpAmount
        )
      );
      coreModel.setParameterValueById(
        "PARAM_BODY_ANGLE_Y",
        lerp(
          result.head.degrees.x * dampener,
          coreModel.getParameterValueById("PARAM_BODY_ANGLE_Y"),
          lerpAmount
        )
      );
      coreModel.setParameterValueById(
        "PARAM_BODY_ANGLE_Z",
        lerp(
          result.head.degrees.z * dampener,
          coreModel.getParameterValueById("PARAM_BODY_ANGLE_Z"),
          lerpAmount
        )
      );

      // Simple example without winking.
      // Interpolate based on old blendshape, then stabilize blink with `Kalidokit` helper function.
      let stabilizedEyes = Kalidokit.Face.stabilizeBlink(
        {
          l: lerp(
            result.eye.l,
            coreModel.getParameterValueById("PARAM_EYE_L_OPEN"),
            0.7
          ),
          r: lerp(
            result.eye.r,
            coreModel.getParameterValueById("PARAM_EYE_R_OPEN"),
            0.7
          )
        },
        result.head.y
      );
      // eye blink
      coreModel.setParameterValueById("PARAM_EYE_L_OPEN", stabilizedEyes.l);
      coreModel.setParameterValueById("PARAM_EYE_R_OPEN", stabilizedEyes.r);

      // mouth
      coreModel.setParameterValueById(
        "PARAM_MOUTH_OPEN_Y",
        lerp(
          result.mouth.y,
          coreModel.getParameterValueById("PARAM_MOUTH_OPEN_Y"),
          0.3
        )
      );
      // Adding 0.3 to PARAM_MOUTH_FORM to make default more of a "smile"
      coreModel.setParameterValueById(
        "PARAM_MOUTH_FORM",
        0.3 +
        lerp(
          result.mouth.x,
          coreModel.getParameterValueById("PARAM_MOUTH_FORM"),
          0.3
        )
      );
    };
  }

};

module.exports = rigFace