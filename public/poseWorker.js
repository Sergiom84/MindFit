// Web Worker para análisis de postura en tiempo real
// Usando Comlink para comunicación más fácil con el hilo principal

// Simulación de análisis de postura (en producción usarías MediaPipe)
const PoseAnalyzer = {
  // Análisis principal de postura
  evaluate(landmarks, ejercicio) {
    if (!landmarks || landmarks.length === 0) {
      return { errores: [], precision: 0 };
    }

    const errores = [];
    let precision = 100;

    switch (ejercicio.toLowerCase()) {
      case 'sentadilla':
        return this.analyzeSentadilla(landmarks);
      case 'press_banca':
        return this.analyzePressBanca(landmarks);
      case 'peso_muerto':
        return this.analyzePesoMuerto(landmarks);
      default:
        return this.analyzeGeneral(landmarks);
    }
  },

  // Análisis específico para sentadillas
  analyzeSentadilla(landmarks) {
    const errores = [];
    let precision = 95;

    // Puntos clave para sentadilla (índices de MediaPipe)
    const leftHip = landmarks[23] || [0, 0, 0];
    const rightHip = landmarks[24] || [0, 0, 0];
    const leftKnee = landmarks[25] || [0, 0, 0];
    const rightKnee = landmarks[26] || [0, 0, 0];
    const leftAnkle = landmarks[27] || [0, 0, 0];
    const rightAnkle = landmarks[28] || [0, 0, 0];

    // 1. Verificar rodillas valgo (rodillas hacia adentro)
    const isKneeValgus = this.checkKneeValgus(leftHip, leftKnee, leftAnkle, rightHip, rightKnee, rightAnkle);
    if (isKneeValgus) {
      errores.push("Rodillas hacia adentro");
      precision -= 15;
    }

    // 2. Verificar profundidad de sentadilla
    const depth = this.calculateSquatDepth(leftHip, leftKnee, rightHip, rightKnee);
    if (depth < 0.7) { // Menos del 70% de profundidad ideal
      errores.push("Falta de profundidad");
      precision -= 10;
    }

    // 3. Verificar alineación de espalda
    const backAlignment = this.checkBackAlignment(landmarks);
    if (!backAlignment) {
      errores.push("Espalda curvada");
      precision -= 12;
    }

    // 4. Verificar balance lateral
    const isBalanced = this.checkLateralBalance(leftHip, rightHip, leftKnee, rightKnee);
    if (!isBalanced) {
      errores.push("Desbalance lateral");
      precision -= 8;
    }

    return {
      errores,
      precision: Math.max(precision, 0),
      anguloMinRodilla: this.calculateKneeAngle(leftHip, leftKnee, leftAnkle),
      tempoConc: this.calculateTempo('concentric'),
      tempoEcc: this.calculateTempo('eccentric'),
      profundidad: depth
    };
  },

  // Análisis específico para press de banca
  analyzePressBanca(landmarks) {
    const errores = [];
    let precision = 95;

    // Puntos clave para press de banca
    const leftShoulder = landmarks[11] || [0, 0, 0];
    const rightShoulder = landmarks[12] || [0, 0, 0];
    const leftElbow = landmarks[13] || [0, 0, 0];
    const rightElbow = landmarks[14] || [0, 0, 0];
    const leftWrist = landmarks[15] || [0, 0, 0];
    const rightWrist = landmarks[16] || [0, 0, 0];

    // 1. Verificar simetría de brazos
    const armSymmetry = this.checkArmSymmetry(leftShoulder, rightShoulder, leftElbow, rightElbow);
    if (!armSymmetry) {
      errores.push("Brazos desalineados");
      precision -= 12;
    }

    // 2. Verificar ángulo de codos
    const elbowAngle = this.calculateElbowAngle(leftShoulder, leftElbow, leftWrist);
    if (elbowAngle < 45 || elbowAngle > 75) {
      errores.push("Ángulo de codos incorrecto");
      precision -= 10;
    }

    // 3. Verificar trayectoria de la barra
    const barPath = this.checkBarPath(leftWrist, rightWrist);
    if (!barPath) {
      errores.push("Trayectoria irregular");
      precision -= 8;
    }

    return {
      errores,
      precision: Math.max(precision, 0),
      anguloMinCodo: elbowAngle,
      tempoConc: this.calculateTempo('concentric'),
      tempoEcc: this.calculateTempo('eccentric')
    };
  },

  // Análisis específico para peso muerto
  analyzePesoMuerto(landmarks) {
    const errores = [];
    let precision = 95;

    // Puntos clave para peso muerto
    const nose = landmarks[0] || [0, 0, 0];
    const leftShoulder = landmarks[11] || [0, 0, 0];
    const rightShoulder = landmarks[12] || [0, 0, 0];
    const leftHip = landmarks[23] || [0, 0, 0];
    const rightHip = landmarks[24] || [0, 0, 0];

    // 1. Verificar posición de la espalda
    const spineAlignment = this.checkSpineAlignment(nose, leftShoulder, leftHip);
    if (!spineAlignment) {
      errores.push("Espalda redondeada");
      precision -= 15;
    }

    // 2. Verificar posición de la barra
    const barPosition = this.checkBarPosition(landmarks);
    if (!barPosition) {
      errores.push("Barra alejada del cuerpo");
      precision -= 10;
    }

    // 3. Verificar extensión de cadera
    const hipExtension = this.checkHipExtension(leftHip, rightHip);
    if (!hipExtension) {
      errores.push("Extensión de cadera incompleta");
      precision -= 8;
    }

    return {
      errores,
      precision: Math.max(precision, 0),
      anguloEspalda: this.calculateBackAngle(nose, leftShoulder, leftHip),
      tempoConc: this.calculateTempo('concentric'),
      tempoEcc: this.calculateTempo('eccentric')
    };
  },

  // Análisis general para otros ejercicios
  analyzeGeneral(landmarks) {
    const errores = [];
    let precision = 90;

    // Verificaciones básicas de postura
    const generalPosture = this.checkGeneralPosture(landmarks);
    if (!generalPosture) {
      errores.push("Postura general incorrecta");
      precision -= 10;
    }

    return {
      errores,
      precision: Math.max(precision, 0),
      tempoConc: this.calculateTempo('concentric'),
      tempoEcc: this.calculateTempo('eccentric')
    };
  },

  // Funciones auxiliares de cálculo
  checkKneeValgus(leftHip, leftKnee, leftAnkle, rightHip, rightKnee, rightAnkle) {
    // Verificar si las rodillas se van hacia adentro
    const leftKneeX = leftKnee[0];
    const leftHipX = leftHip[0];
    const leftAnkleX = leftAnkle[0];
    
    const rightKneeX = rightKnee[0];
    const rightHipX = rightHip[0];
    const rightAnkleX = rightAnkle[0];

    // Rodilla izquierda hacia adentro
    const leftValgus = leftKneeX > leftHipX && leftKneeX > leftAnkleX;
    // Rodilla derecha hacia adentro  
    const rightValgus = rightKneeX < rightHipX && rightKneeX < rightAnkleX;

    return leftValgus || rightValgus;
  },

  calculateSquatDepth(leftHip, leftKnee, rightHip, rightKnee) {
    // Calcular profundidad basada en la diferencia Y entre cadera y rodilla
    const leftDepth = Math.abs(leftHip[1] - leftKnee[1]);
    const rightDepth = Math.abs(rightHip[1] - rightKnee[1]);
    const avgDepth = (leftDepth + rightDepth) / 2;
    
    // Normalizar a un valor entre 0 y 1
    return Math.min(avgDepth * 2, 1);
  },

  checkBackAlignment(landmarks) {
    // Verificar alineación de espalda usando hombros y caderas
    const leftShoulder = landmarks[11] || [0, 0, 0];
    const rightShoulder = landmarks[12] || [0, 0, 0];
    const leftHip = landmarks[23] || [0, 0, 0];
    const rightHip = landmarks[24] || [0, 0, 0];

    const shoulderMidpoint = [(leftShoulder[0] + rightShoulder[0]) / 2, (leftShoulder[1] + rightShoulder[1]) / 2];
    const hipMidpoint = [(leftHip[0] + rightHip[0]) / 2, (leftHip[1] + rightHip[1]) / 2];

    // Verificar que la diferencia X sea mínima (espalda recta)
    const xDifference = Math.abs(shoulderMidpoint[0] - hipMidpoint[0]);
    return xDifference < 0.1; // Umbral de tolerancia
  },

  checkLateralBalance(leftHip, rightHip, leftKnee, rightKnee) {
    // Verificar balance lateral comparando posiciones Y
    const hipBalance = Math.abs(leftHip[1] - rightHip[1]);
    const kneeBalance = Math.abs(leftKnee[1] - rightKnee[1]);
    
    return hipBalance < 0.05 && kneeBalance < 0.05; // Umbrales de tolerancia
  },

  calculateKneeAngle(hip, knee, ankle) {
    // Calcular ángulo de la rodilla usando vectores
    const vector1 = [hip[0] - knee[0], hip[1] - knee[1]];
    const vector2 = [ankle[0] - knee[0], ankle[1] - knee[1]];
    
    const dotProduct = vector1[0] * vector2[0] + vector1[1] * vector2[1];
    const magnitude1 = Math.sqrt(vector1[0] ** 2 + vector1[1] ** 2);
    const magnitude2 = Math.sqrt(vector2[0] ** 2 + vector2[1] ** 2);
    
    const cosAngle = dotProduct / (magnitude1 * magnitude2);
    const angleRad = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
    const angleDeg = (angleRad * 180) / Math.PI;
    
    return Math.round(angleDeg);
  },

  calculateTempo(phase) {
    // Simulación de cálculo de tempo (en producción usarías datos temporales reales)
    if (phase === 'concentric') {
      return (1 + Math.random()).toFixed(1);
    } else {
      return (2 + Math.random() * 2).toFixed(1);
    }
  },

  checkArmSymmetry(leftShoulder, rightShoulder, leftElbow, rightElbow) {
    const leftArmAngle = Math.atan2(leftElbow[1] - leftShoulder[1], leftElbow[0] - leftShoulder[0]);
    const rightArmAngle = Math.atan2(rightElbow[1] - rightShoulder[1], rightElbow[0] - rightShoulder[0]);
    
    return Math.abs(leftArmAngle - rightArmAngle) < 0.2; // Tolerancia en radianes
  },

  calculateElbowAngle(shoulder, elbow, wrist) {
    const vector1 = [shoulder[0] - elbow[0], shoulder[1] - elbow[1]];
    const vector2 = [wrist[0] - elbow[0], wrist[1] - elbow[1]];
    
    const dotProduct = vector1[0] * vector2[0] + vector1[1] * vector2[1];
    const magnitude1 = Math.sqrt(vector1[0] ** 2 + vector1[1] ** 2);
    const magnitude2 = Math.sqrt(vector2[0] ** 2 + vector2[1] ** 2);
    
    const cosAngle = dotProduct / (magnitude1 * magnitude2);
    const angleRad = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
    const angleDeg = (angleRad * 180) / Math.PI;
    
    return Math.round(angleDeg);
  },

  checkBarPath(leftWrist, rightWrist) {
    // Verificar que la trayectoria de la barra sea recta
    const barMidpoint = [(leftWrist[0] + rightWrist[0]) / 2, (leftWrist[1] + rightWrist[1]) / 2];
    // En producción, compararías con posiciones anteriores
    return true; // Simplificado para demo
  },

  checkSpineAlignment(nose, shoulder, hip) {
    // Verificar alineación de columna
    const spineVector = [hip[0] - shoulder[0], hip[1] - shoulder[1]];
    const headVector = [nose[0] - shoulder[0], nose[1] - shoulder[1]];
    
    // Verificar que la cabeza esté alineada con la columna
    const alignment = Math.abs(spineVector[0] - headVector[0]);
    return alignment < 0.1;
  },

  checkBarPosition(landmarks) {
    // Verificar que la barra esté cerca del cuerpo
    // Simplificado para demo
    return Math.random() > 0.3;
  },

  checkHipExtension(leftHip, rightHip) {
    // Verificar extensión completa de cadera
    // Simplificado para demo
    return Math.random() > 0.2;
  },

  calculateBackAngle(nose, shoulder, hip) {
    const vector = [hip[0] - shoulder[0], hip[1] - shoulder[1]];
    const angleRad = Math.atan2(vector[1], vector[0]);
    const angleDeg = (angleRad * 180) / Math.PI;
    return Math.round(Math.abs(angleDeg));
  },

  checkGeneralPosture(landmarks) {
    // Verificación general de postura
    return Math.random() > 0.3; // Simplificado para demo
  }
};

// Exponer el analizador para uso en el worker
if (typeof self !== 'undefined') {
  self.onmessage = function(e) {
    const { landmarks, ejercicio, id } = e.data;
    const result = PoseAnalyzer.evaluate(landmarks, ejercicio);
    self.postMessage({ id, result });
  };
}

// Para uso directo (sin worker)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PoseAnalyzer;
}
