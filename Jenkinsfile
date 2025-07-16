pipeline {
  agent any
  
  environment {
    DOCKER_HUB_USER = 'krunalbhandekar10'
    VITE_API_URL = 'https://server.krunal.bar'
  }

  stages {
    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/krunalbhandekar/devopsified-mern-app.git'
      }
    }

    stage('Build Backend') {
      steps {
        sh 'docker build -t $DOCKER_HUB_USER/mern-server -f Dockerfile.server .'
      }
    }

    stage('Build Frontend') {
      steps {
        sh 'docker build -t $DOCKER_HUB_USER/mern-client --build-arg VITE_API_URL=$VITE_API_URL -f Dockerfile.client .'
      }
    }

    stage('Push to DockerHub') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
          sh 'echo $PASSWORD | docker login -u $USERNAME --password-stdin'
          sh 'docker push $DOCKER_HUB_USER/mern-server'
          sh 'docker push $DOCKER_HUB_USER/mern-client'
        }
      }
    }

    stage('Deploy to K8s') {
      steps {
        sh 'kubectl apply -f k8s/'
      }
    }
  }
}
