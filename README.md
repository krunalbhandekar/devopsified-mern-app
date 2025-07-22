# 🚀 DevOpsified MERN App Deployment on AWS EKS

This project showcase a **CI/CD pipeline** for deploying a **MERN (MongoDB, Express, React, Node.js)** stack application using:

- **Jenkins** for Continuous Integration & Deployment
- **Docker** for containerization
- **Amazon EKS (Elastic Kubernetes Service)** for orchestration
- **NGINX Ingress Controller** for routing
- **Kubernetes Secrets** for managing sensitive data like MongoDB URL

---

## 🛠️ Tech Stack

- React (Frontend)
- Node.js + Express (Backend)
- MongoDB (Database)
- Docker & DockerHub
- Jenkins
- Kubernetes (EKS)
- NGINX Ingress Controller
- AWS CLI + `kubectl`

---

## 📁 Project Structure

```bash
devopsified-mern-app/
├── client/         # React frontend
├── server/         # Node.js backend
├── k8s/
│ ├── client-deployment.yml
| ├── client-deployment.tpl.yml
│ ├── client-ingress.yml
│ ├── server-deployment.yml
| ├── server-deployment.tpl.yml
│ ├── server-ingress.yml
│ └── secret.yml    # Contains MONGO_URL secret (auto-generated in pipeline)
├── Dockerfile.client
├── Dockerfile.server
└── Jenkinsfile     # CI/CD pipeline definition
```

---

## ⚙️ Before You Begin: Update Your Credentials

This project is configured with **personal credentials/usernames**. If you're trying this on your own setup, make sure to update the following values in the repository:

### 🔄 Required Updates

**🔹 DockerHub Username**

Update in:

- **`Jenkinsfile`** → **`environment`** block
- Kubernetes deployment files:
  - **`k8s/client-deployment.tpl.yml`**
  - **`k8s/client-deployment.yml`**
  - **`k8s/server-deployment.tpl.yml`**
  - **`k8s/server-deployment.yml`**

**🔹 Jenkinsfile (`environment` block)**

Update the following values:

- **`AWS_REGION`** — e.g., **`ap-south-1`**
- **`CLUSTER_NAME`** — your EKS cluster name
- **`GIT_REPO`** — your forked GitHub repo URL
- **`DOCKERHUB_USERNAME`** — your DockerHub username
- **`YOUR_EMAIL`** — your email address (gmail)

---

## ☁️ Step 1: Set Up EKS Cluster & Node Group (`t3.medium` or higher)

- Follow the video tutorial to proceed with cluster and node group creation.

👉 **[Watch the EKS Cluster Setup Video](https://drive.google.com/file/d/1xZGNourGj8O7jQJuzwy-7SVm74DYC_jB/view?usp=sharing)**

---

## ☁️ Step 2: Launch Jenkins server (`t2.medium` or `t3.medium`)

### 🔐 Security Group Inbound Rules:

- `22` - SSH
- `80` Http
- `443` - Https
- `8080` - Jenkins UI

### 🔧 Jenkins Setup (Ubuntu)

```bash
# SSH into the EC2 instance
ssh -i <key.pem> ubuntu@<jenkin-server-public-ip>

# Update packages
sudo apt update -y

# Install Java
sudo apt install -y fontconfig openjdk-21-jre
java -version
```

### 🧩 Install Jenkins

```bash
sudo mkdir -p /etc/apt/keyrings
sudo wget -O /etc/apt/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
```

```bash
echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
```

```bash
sudo apt update -y
sudo apt install -y jenkins
sudo systemctl start jenkins.service
sudo systemctl enable jenkins.service
```

### 🔨 Install Dependencies

```bash
sudo apt install -y git docker.io curl unzip
```

### 📦 Install kubectl, eksctl, awscli

```bash
# kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
kubectl version --client
```

```bash
# eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin/
eksctl version
```

```bash
uname -m
```

You’ll get one of the following:

- x86_64 → 64-bit Intel/AMD (most common for EC2)
- aarch64 or arm64 → ARM architecture (e.g., Graviton instances)

Download the correct AWS CLI version for your architecture:

- For x86_64 (Intel/AMD):

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
```

- For aarch64 (ARM/Graviton):

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip"
```

```bash
unzip awscliv2.zip
sudo ./aws/install --update
```

```bash
aws --version
```

or

```bash
/usr/local/bin/aws --version
```

### Apply Docker group changes

```bash
newgrp docker
```

### 🔧 Jenkins Access

- URL:`http://<jenkin-server-public-ip>:8080`
- Password:

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

Install recommended plugins and create an admin user.

### 🛡️ AWS IAM Role for Jenkins

- **`AmazonEKSClusterPolicy`** ✅ (Required for cluster-level access)
- **`AmazonEKSServicePolicy`** ✅ (Required for some EKS APIs)
- **`AmazonEC2ContainerRegistryReadOnly`** ✅ (Optional if pulling images from ECR)

### ✅ Custom Inline Policy (JSON)

```bash
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        // EKS cluster and nodegroup access
        "eks:DescribeCluster",
        "eks:ListClusters",
        "eks:ListNodegroups",
        "eks:DescribeNodegroup",
        "eks:DescribeClusterVersions",
        "eks:DescribeUpdate",
        "eks:UpdateClusterConfig",
        "eks:AccessKubernetesApi",
        "eks:AssociateIdentityProviderConfig",
        "eks:DescribeIdentityProviderConfig",
        "eks:ListIdentityProviderConfigs"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        // ECR access (optional: needed if using ECR)
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        // Identity access (required for most AWS CLI commands)
        "sts:GetCallerIdentity"
      ],
      "Resource": "*"
    }
  ]
}
```

Attach the role to the Jenkins EC2 instance.

```bash
aws configure
```

Provide your **AWS Access Key**, **Secret Key**, **region**, and **output format**.

```bash
eksctl create iamidentitymapping \
  --region <region-name> \
  --cluster <cluster-name> \
  --arn arn:aws:iam::<account-id>:role/<jenkins-role-name> \
  --username jenkins \
  --group system:masters
```

Update kubeconfig and verify:

```bash
aws eks update-kubeconfig --region <region-name> --name <cluster-name>
```

```bash
kubectl get nodes
```

### 🔁 Optional: Edit aws-auth ConfigMap (if needed)

```bash
kubectl edit configmap aws-auth -n kube-system
```

⚠️ Important: If mapRoles: does not exist yet, you need to create it like this:

```bash
mapRoles: |
  - rolearn: arn:aws:sts::<account-id>:assumed-role/<jenkins-role-name>
    username: jenkins
    groups:
      - system:masters
```

### ⚠️ Clear AWS credentials after setup:

Clear out credentials from Jenkins EC2 to avoid accidental AWS access leakage.

```bash
rm -rf ~/.aws/credentials ~/.aws/config
```

Restart Jenkins and Docker:

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart docker
sudo systemctl restart jenkins
```

---

## Step 3: Install following Plugins

Navigate: **`Jenkins Dashboard`** → **`Manage Jenkins`** → **`Plugins`** → **`Available Plugins`**

- Git
- GitHub
- GitHub Integration
- Pipeline
- Docker Pipeline
- SSH Agent
- Pipeline stage view
- Aws credentials
- Email Extension

---

## 🔐 Step 4: Jenkins Credentials Setup

### Dockerhub Credential

Navigate: **`Jenkins Dashboard`** → **`Manage Jenkins`** → **`Credentials`** → **`Global`** → **`Add Credentials`**

- kind: Username and password
- scope: Global (Jenkins, nodes, items, all child items, etc)
- username: `<your-dockerhub-username>`
- password: ` <your-dockerhub-password>`
- id: `dockerhub-cred-id`
- description: `dockerhub-cred-id`

Click on Create

### AWS Credential

Click on Add Credentials

- kind: AWS Credentials
- scope: Global (Jenkins, nodes, items, all child items, etc)
- id: `aws-cred-id`
- description: `aws-cred-id`
- Access Key ID: `<your-aws-access-key>`
- Secret Access Key: `<your-aws-secret-access-key>`

Click on Create

### MongoDB Credential

Click on Add Credentials

- kind: Secret text
- scope: Global (Jenkins, nodes, items, all child items, etc)
- Secret: `mongodb+srv://<mongo-username>:<mongo-password>@cluster0.1cygt.mongodb.net/<db-name>?retryWrites=true&w=majority`
- id: `mongo-cred-id`
- description: `mongo-cred-id`

Click on Create

---

## Step 5: Github Webhook Setup

### On GitHub Repository:

- Go to **`Repository Settings`** → **`Webhooks`** → **`Add webhook`**
- Payload URL: `http://<jenkin-server-public-ip>:8080/github-webhook/`
- Content type: `application/json`
- Which events would you like to trigger this webhook: `Just the push event`
- Click **Add Webhook**

---

## Step 6: Jenkins Job Configuration

Create a Pipeline Job

Navigate: **`Jenkins Dashboard`** → (**`New Item`** or **`Create a job`**) → **`<project-name>`**

- Select **Pipeline** → Click OK
- Under **Triggers / Build Triggers** Section
  - Enable **`Github hook trigger for GITScm polling`**
- Under **Pipeline** section
  - Definition: `Pipeline script from SCM`
  - SCM: `Git`
  - Repository URL: `https://github.com/<username>/<repository-name>.git`
  - Add Credential if private repository
  - Branches to build: `*/main` or `*/master` (depend on your repository)
  - Script Path: `Jenkinsfile`

**Apply → Save → Build Now**

---

## Step 7: Configure SMTP in Jenkins

Navigate: **`Jenkins Dashboard`** → **`Manage Jenkins`** → **`System`**

- Scroll to **`Extended E-mail Notification`**
- SMTP Server: **`smtp.gmail.com`**
- SMTP Port: **`587`**
- Click the **`Advanced`** button under **`SMTP Server/SMTP Port`**
- Click **`+ Add`** → **`Jenkins`**
  - Domain: Global Credentials (unrestricted)
  - Kind: Username and password
  - Scope: Global (Jenkins, nodes, items, all child items, etc)
  - Username: **`<your-email-address(gmail)>`**
  - Password: **`Enter Gmail App Password`**  
    📌 App Password can be generated at: https://myaccount.google.com/apppasswords
  - ID: **`email-app-password`**
  - Description: **`email-app-password`**
  - Click **Add**
- Select newly created Credential
- enable **`Use TLS`**
- Default Content Type: **`HTML (text/html)`**
- Default Recipients: **`<your-email-address(gmail)>`**

**Apply → Save**

---

## ✅ Step 8: Access the Application

After a successful Jenkins build:

- Go to **AWS Console → EC2 → Load Balancers**
- Wait for the Load Balancer state to change from **Provisioning** to **Active**
- Copy the **DNS name** of the Application Load Balancer (ALB)

### 🔗 Access your app:

- **Frontend: `http://<alb-dns-url>`**
- **Backend API: `http://<alb-dns-url>/api`**

### 📩 Heads Up: Email Notification Enabled

After a successful Jenkins build, you’ll **automatically receive an email** with the **ALB URL and deployment details**.

---

## 🔁 Step 9: Verify CI/CD with Auto Deployment

To test auto-deployment:

- Make changes in your **client** or **server** code
- Push the updates to the **`main`** (or **`master`**) branch on GitHub
- Jenkins will automatically trigger a new build (CI/CD in action)
- Once the build is complete, revisit your app via the ALB URL
- You should now see the updated changes live

That’s the power of a fully automated **CI/CD pipeline**! 🚀

---

### 👨‍💻 Author

Maintained by **[Krunal Bhandekar](https://www.linkedin.com/in/krunal-bhandekar/)**

---
