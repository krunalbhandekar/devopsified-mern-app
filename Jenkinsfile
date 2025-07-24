pipeline {
  agent any

  environment {
    AWS_REGION = 'ap-south-1'
    CLUSTER_NAME = 'cluster'
    GIT_REPO = 'https://github.com/krunalbhandekar/devopsified-mern-app.git'
    KUBECONFIG = '/var/lib/jenkins/.kube/config'
    DOCKERHUB_USERNAME = 'krunalbhandekar10'
    DOCKERHUB_CREDENTIALS_ID = 'dockerhub-cred-id'
    MONGO_CREDENTIALS_ID = 'mongo-cred-id'
    AWS_CREDENTIALS_ID = 'aws-cred-id'
    YOUR_EMAIL = 'krunalbhandekar10@gmail.com'
    NAMESPACE = "default"
  }

  stages {

    stage('Checkout Project') {
            steps {
                script {
                    try {
                        git branch: 'main', url: "${env.GIT_REPO}"
                        echo "Successfully checked out repository"
                    } catch (Exception e) {
                        error "Failed to checkout repository: ${e.getMessage()}"
                    }
                }
            }
        }
        
        stage('Validate Prerequisites') {
            steps {
                script {
                    try {
                        sh '''
                            # Check if required tools are installed
                            command -v docker >/dev/null 2>&1 || { echo "Docker not found"; exit 1; }
                            command -v kubectl >/dev/null 2>&1 || { echo "kubectl not found"; exit 1; }
                            command -v aws >/dev/null 2>&1 || { echo "AWS CLI not found"; exit 1; }
                            
                            # Check if Dockerfiles exist
                            if [ ! -f "Dockerfile.client" ]; then
                                echo "Dockerfile.client not found"
                                exit 1
                            fi
                            if [ ! -f "Dockerfile.server" ]; then
                                echo "Dockerfile.server not found"
                                exit 1
                            fi
                            
                            echo "All prerequisites validated"
                        '''
                    } catch (Exception e) {
                        error "Prerequisites validation failed: ${e.getMessage()}"
                    }
                }
            }
        }

 stage('Update kubeconfig') {
            steps {
                withCredentials([aws(accessKeyVariable: 'AWS_ACCESS_KEY_ID', credentialsId: "${AWS_CREDENTIALS_ID}", secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    script {
                        try {
                            sh '''
                                # Create .kube directory with proper permissions
                                echo "Creating .kube directory..."
                                mkdir -p /var/lib/jenkins/.kube
                                chmod 700 /var/lib/jenkins/.kube
                                
                                # Verify AWS credentials
                                echo "Verifying AWS credentials..."
                                aws sts get-caller-identity
                                
                                # Check if AWS CLI is configured properly
                                echo "Checking AWS configuration..."
                                aws configure list
                                
                                # Verify EKS cluster exists
                                echo "Checking if EKS cluster exists..."
                                aws eks describe-cluster --region ${AWS_REGION} --name ${CLUSTER_NAME}
                                
                                # Update kubeconfig with verbose output
                                echo "Updating kubeconfig..."
                                aws eks update-kubeconfig --region ${AWS_REGION} --name ${CLUSTER_NAME} --kubeconfig ${KUBECONFIG} --verbose
                                
                                # Set proper permissions
                                chmod 600 ${KUBECONFIG}
                                
                                # Verify kubeconfig was created
                                echo "Checking kubeconfig file..."
                                ls -la ${KUBECONFIG}
                                
                                # Test kubectl connection
                                echo "Testing kubectl connection..."
                                kubectl cluster-info --request-timeout=30s
                                
                                echo "kubeconfig updated successfully"
                            '''
                        } catch (Exception e) {
                            sh '''
                                echo "Debugging kubeconfig update failure..."
                                echo "Current user: $(whoami)"
                                echo "HOME directory: $HOME"
                                echo "AWS CLI version: $(aws --version)"
                                echo "kubectl version: $(kubectl version --client)"
                                echo "Current AWS region: $AWS_REGION"
                                echo "Cluster name: $CLUSTER_NAME"
                                echo "Kubeconfig path: $KUBECONFIG"
                                
                                # Check if .kube directory exists
                                if [ -d "/var/lib/jenkins/.kube" ]; then
                                    echo ".kube directory exists"
                                    ls -la /var/lib/jenkins/.kube/ || echo "Directory is empty"
                                else
                                    echo ".kube directory does not exist"
                                fi
                                
                                # Check AWS credentials
                                echo "AWS credential check:"
                                aws sts get-caller-identity || echo "AWS credentials not configured"
                                
                                # List available clusters
                                echo "Available EKS clusters:"
                                aws eks list-clusters --region ${AWS_REGION} || echo "Cannot list clusters"
                                
                                # Check if cluster exists
                                echo "Checking specific cluster:"
                                aws eks describe-cluster --region ${AWS_REGION} --name ${CLUSTER_NAME} || echo "Cluster not found or no access"
                            '''
                            error "Failed to update kubeconfig: ${e.getMessage()}"
                        }
                    }
                }
            }
        }

          stage('Docker Login') {
            steps {
                script {
                    try {
                        withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS_ID}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                            sh '''
                                echo "Logging into Docker Hub..."
                                echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                                echo "Docker login successful"
                            '''
                        }
                    } catch (Exception e) {
                        error "Docker login failed: ${e.getMessage()}"
                    }
                }
            }
        }


 stage('Build & Push Docker Images') {
            parallel {
                stage('Build Client Image') {
                    steps {
                        script {
                            try {
                                sh '''
                                    echo "Building client image..."
                                    export DOCKER_BUILDKIT=0
                                    
                                    # Build with build number tag
                                    docker build -t ${DOCKERHUB_USERNAME}/mern-client:${BUILD_NUMBER} -f Dockerfile.client .
                                    
                                    echo "Pushing client image..."
                                    docker push ${DOCKERHUB_USERNAME}/mern-client:${BUILD_NUMBER}
                                    
                                    echo "Client image built and pushed successfully"
                                '''
                            } catch (Exception e) {
                                error "Failed to build/push client image: ${e.getMessage()}"
                            }
                        }
                    }
                }
                
                stage('Build Server Image') {
                    steps {
                        script {
                            try {
                                sh '''
                                    echo "Building server image..."
                                    export DOCKER_BUILDKIT=0
                                    
                                    # Build with build number tag
                                    docker build -t ${DOCKERHUB_USERNAME}/mern-server:${BUILD_NUMBER} -f Dockerfile.server .
                                    
                                    echo "Pushing server image..."
                                    docker push ${DOCKERHUB_USERNAME}/mern-server:${BUILD_NUMBER}
                                    
                                    echo "Server image built and pushed successfully"
                                '''
                            } catch (Exception e) {
                                error "Failed to build/push server image: ${e.getMessage()}"
                            }
                        }
                    }
                }
            }
        }
    
      stage('Verify EKS Access') {
            steps {
                withCredentials([aws(accessKeyVariable: 'AWS_ACCESS_KEY_ID', credentialsId: "${AWS_CREDENTIALS_ID}", secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    script {
                        try {
                            sh '''
                                echo "Verifying EKS access..."
                                aws sts get-caller-identity
                                aws eks list-clusters --region ${AWS_REGION}
                                kubectl get nodes
                                kubectl get namespaces
                                echo "EKS access verified"
                            '''
                        } catch (Exception e) {
                            error "EKS access verification failed: ${e.getMessage()}"
                        }
                    }
                }
            }
        }

          
        stage('Setup NGINX Ingress Controller') {
            steps {
                withCredentials([aws(accessKeyVariable: 'AWS_ACCESS_KEY_ID', credentialsId: "${AWS_CREDENTIALS_ID}", secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    script {
                        try {
                            sh '''
                                echo "Checking if NGINX Ingress Controller exists..."
                            
                                # Check if ingress-nginx namespace exists
                                if ! kubectl get namespace ingress-nginx >/dev/null 2>&1; then
                                    echo "Installing NGINX Ingress Controller..."
                                    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.4/deploy/static/provider/aws/deploy.yaml --validate=false
                                
                                    echo "Waiting for Ingress Controller to be ready..."
                                    kubectl wait --namespace ingress-nginx \
                                    --for=condition=Ready pod \
                                    --selector=app.kubernetes.io/component=controller \
                                    --timeout=300s
                                else
                                    echo "NGINX Ingress Controller already exists"
                                fi
                            '''
                        } catch (Exception e) {
                            error "Warning: Ingress controller setup had issues: ${e.getMessage()}"
                        }
                    }
                }
            }
        }

        stage('Generate MongoDB Secret') {
            steps {
                script {
                    try {
                        withCredentials([string(credentialsId: "${MONGO_CREDENTIALS_ID}", variable: 'MONGO_URL')]) {
                            sh '''
                                echo "Generating MongoDB secret..."
                                
                                # Create k8s directory if it doesn't exist
                                mkdir -p k8s
                                
                                # Generate base64 encoded MongoDB URI
                                ENCODED_MONGO_URL=$(echo -n "${MONGO_URL}" | base64 -w 0)
                                
                                # Create secret YAML
                                cat > k8s/secret.yml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: mongo-secret
  namespace: default
type: Opaque
data:
  MONGO_URL: ${ENCODED_MONGO_URL}
EOF
                                
                                echo "MongoDB secret generated"
                            '''
                        }
                    } catch (Exception e) {
                        error "Failed to generate MongoDB secret: ${e.getMessage()}"
                    }
                }
            }
        }

     stage('Deploy K8s Resources') {
            steps {
                withCredentials([aws(accessKeyVariable: 'AWS_ACCESS_KEY_ID', credentialsId: "${AWS_CREDENTIALS_ID}", secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                script {
                    try {
                        sh '''
                            echo "Applying secret and ingress..."
                            kubectl apply -f k8s/secret.yml
                            kubectl apply -f k8s/client-ingress.yml
                            kubectl apply -f k8s/server-ingress.yml

                            echo "Deploying client...."
                              if kubectl get deployment client; then
                                kubectl set image deployment/client client=${DOCKERHUB_USERNAME}/mern-client:${BUILD_NUMBER}
                                if ! kubectl rollout status deployment/client --timeout=300s; then 
                                    echo "Client rollout failed. Rolling back..."
                                    kubectl rollout undo deployment/client
                                    exit 1
                                fi
                            else 
                                echo "Creating client deployment with new image tag"
                                envsubst < k8s/client-deployment.tpl.yml | kubectl apply -f -
                            fi

                              echo "Deploying server...."
                              if kubectl get deployment server; then
                                kubectl set image deployment/server server=${DOCKERHUB_USERNAME}/mern-server:${BUILD_NUMBER}
                                if ! kubectl rollout status deployment/server --timeout=300s; then
                                    echo "Server rollout failed. Rolling back..."
                                    kubectl rollout undo deployment/server
                                    exit 1
                                fi
                            else 
                                echo "Creating server deployment with new image tag"
                                envsubst < k8s/server-deployment.tpl.yml | kubectl apply -f -
                            fi
                            
                            echo "Kubernetes resources deployed successfully"
                        '''
                    } catch (Exception e) {
                        error "Failed to deploy Kubernetes resources: ${e.getMessage()}"
                    }
                }
                }
            }
        }

stage('Verify Deployment') {
            steps {
                                withCredentials([aws(accessKeyVariable: 'AWS_ACCESS_KEY_ID', credentialsId: "${AWS_CREDENTIALS_ID}", secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                script {
                    try {
                        sh '''
                            echo "Verifying deployment..."
                            
                            echo "Pods status:"
                            kubectl get pods -o wide
                            
                            echo "Services status:"
                            kubectl get svc
                            
                            echo "Ingress status:"
                            kubectl get ingress
                            
                            echo "Deployment status:"
                            kubectl get deployments
                            
                            # Check if pods are running
                            echo "Waiting for pods to be running..."
                            kubectl wait --for=condition=Ready pod -l app=client --timeout=120s || echo "Client pods not ready yet"
                            kubectl wait --for=condition=Ready pod -l app=server --timeout=120s || echo "Server pods not ready yet"
                            
                            echo "Deployment verification completed"
                        '''
                    } catch (Exception e) {
                        error "Warning: Deployment verification had issues: ${e.getMessage()}"
                    }
                }
                                }
            }
        }

        stage('Fetch ALB URL') {
            steps {
                                withCredentials([aws(accessKeyVariable: 'AWS_ACCESS_KEY_ID', credentialsId: "${AWS_CREDENTIALS_ID}", secretKeyVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                script {
                    def clientAlb = sh (
                    script: "kubectl get ingress client-ingress -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'",
                    returnStdout: true
                  ).trim()

                  def serverAlb = sh (
                    script: "kubectl get ingress server-ingress -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'",
                    returnStdout: true
                  ).trim()

                  echo "Client ALB: ${clientAlb}"
                  echo "Server ALB: ${serverAlb}"

                  if (clientAlb != serverAlb) {
                    error "ALB mismatch between client and server ingresses!"
                  }

                  env.ALB_URL = clientAlb
                }
                                }
            }
        }
    }

  post {
        always {
            script {
                sh '''
                    echo "Cleaning up Docker images..."
                    docker system prune -f || true
                    echo "Cleanup completed"
                '''
            }
        }
        success {
            script {
            emailext(
                subject: "Your MERN application has been successfully deployed to EKS!",
                body: """<p>Hello Team,</p>
                <p>The <b>DevOpsified MERN App</b> has been successfully deployed to EKS.</p>
                <p>Access it here:</p>
                <p>Frontend: <a href="http://${env.ALB_URL}">http://${env.ALB_URL}</a></p>
                <p>Backend: <a href="http://${env.ALB_URL}/api">http://${env.ALB_URL}/api</a></p>
                <p>Regards,<br/>Jenkins CI/CD</p>""",
                mimeType:'text/html',
                to:"${env.YOUR_EMAIL}"
            )
        }
    }
        failure {
            echo '''
            DEPLOYMENT FAILED!
            
            Please check the Jenkins console output for detailed error messages.
            Common issues to check:
            - AWS credentials and permissions
            - Kubernetes cluster connectivity
            - Docker Hub credentials
            - MongoDB connection string
            '''
        }
        unstable {
            echo 'Deployment completed with warnings. Please review the logs.'
        }
    }
}