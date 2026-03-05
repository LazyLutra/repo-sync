<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import {
  Server,
  Settings2,
  Play,
  Square,
  Network,
  FolderSearch,
  Trash2,
  Plus,
  Terminal,
} from "lucide-vue-next";
import { Modal, Button, message } from "ant-design-vue";

interface ServiceLog {
  time: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

interface EnvService {
  id: string;
  type: "nacos" | "redis" | "nginx" | "unknown";
  name: string;
  port: number;
  dirPath: string;
  startCommand: string;
  configFilePath: string;
  isRunning: boolean;
  statusText: string;
}

const services = ref<EnvService[]>([]);

const serviceLogs = ref<ServiceLog[]>([
  {
    time: getLogTime(),
    message: "Ready. Select a service to start...",
    type: "info",
  },
]);

const logContentRef = ref<HTMLElement | null>(null);

const configModalVisible = ref(false);
const configModalTitle = ref("");
const configContent = ref("");
const configFilePath = ref("");
const configLoading = ref(false);

const cmdModalVisible = ref(false);
const cmdModalTitle = ref("");
const cmdContent = ref("");
let cmdEditingService: EnvService | null = null;

function getLogTime() {
  const now = new Date();
  return now.toTimeString().split(" ")[0];
}

function addServiceLog(
  msg: string,
  type: "info" | "success" | "warning" | "error" = "info",
) {
  serviceLogs.value.push({ time: getLogTime(), message: msg, type });
  // 自动滚动到底部
  nextTick(() => {
    if (logContentRef.value) {
      logContentRef.value.scrollTop = logContentRef.value.scrollHeight;
    }
  });
}

function clearServiceLogs() {
  serviceLogs.value = [];
}

async function toggleService(service: EnvService) {
  const api = (window as any).electronAPI;

  if (!service.isRunning) {
    if (!service.startCommand) {
      message.warning("请先设置启动命令");
      return;
    }

    service.statusText = "Starting...";
    addServiceLog(
      `[${service.name}] 正在启动... 命令: ${service.startCommand}`,
      "info",
    );

    try {
      const ok = await api.startEnvService({
        serviceId: service.id,
        dirPath: service.dirPath,
        startCommand: service.startCommand,
      });

      if (ok) {
        service.isRunning = true;
        service.statusText = "Running";
        addServiceLog(`[${service.name}] 进程已启动`, "success");
      } else {
        service.statusText = "Stopped";
        addServiceLog(`[${service.name}] 启动失败`, "error");
      }
    } catch (err: any) {
      service.statusText = "Stopped";
      addServiceLog(`[${service.name}] 启动异常: ${err.message}`, "error");
    }
  } else {
    addServiceLog(`[${service.name}] 正在停止...`, "warning");
    try {
      await api.stopEnvService(service.id);
      service.isRunning = false;
      service.statusText = "Stopped";
      addServiceLog(`[${service.name}] 服务已停止`, "info");
    } catch (err: any) {
      addServiceLog(`[${service.name}] 停止异常: ${err.message}`, "error");
    }
  }
}

// 持久化保存服务列表（只保存必要字段，不含运行时状态）
function saveServices() {
  const api = (window as any).electronAPI;
  const data = services.value.map((s) => ({
    id: s.id,
    type: s.type,
    name: s.name,
    port: s.port,
    dirPath: s.dirPath,
    startCommand: s.startCommand,
    configFilePath: s.configFilePath,
  }));
  api.saveEnvServices(data);
}

// 监听主进程推送过来的实时日志和退出事件，并加载已保存的服务
onMounted(async () => {
  const api = (window as any).electronAPI;

  // 从持久化存储加载已保存的服务列表
  try {
    const saved = await api.getEnvServices();
    if (saved && saved.length > 0) {
      services.value = saved.map((s: any) => ({
        ...s,
        isRunning: false,
        statusText: "Stopped",
      }));
      addServiceLog(`已加载 ${saved.length} 个已保存的服务`, "info");
    }
  } catch (err: any) {
    console.error("加载已保存服务失败:", err);
  }

  api.onEnvServiceLog((payload: any) => {
    const service = services.value.find((s) => s.id === payload.serviceId);
    const prefix = service ? `[${service.name}]` : `[${payload.serviceId}]`;
    const logType = payload.stream === "stderr" ? "warning" : "info";
    addServiceLog(`${prefix} ${payload.message}`, logType);
  });

  api.onEnvServiceExit((payload: any) => {
    const service = services.value.find((s) => s.id === payload.serviceId);
    if (service) {
      service.isRunning = false;
      service.statusText = "Stopped";
    }
    const prefix = service ? `[${service.name}]` : `[${payload.serviceId}]`;
    if (payload.error) {
      addServiceLog(`${prefix} 进程错误: ${payload.error}`, "error");
    } else {
      addServiceLog(
        `${prefix} 进程已退出 (code: ${payload.code})`,
        payload.code === 0 ? "info" : "error",
      );
    }
  });
});

onUnmounted(() => {
  const api = (window as any).electronAPI;
  api.offEnvServiceLog();
  api.offEnvServiceExit();
});

async function openConfigModal(service: EnvService) {
  configModalTitle.value = `编辑配置 - ${service.name}`;
  configFilePath.value = service.dirPath + "/" + service.configFilePath;
  configLoading.value = true;
  configModalVisible.value = true;

  try {
    const content = await (window as any).electronAPI.readEnvConfig(
      configFilePath.value,
    );
    configContent.value =
      content ||
      `# 无法读取配置文件: ${service.configFilePath}\n# 请确认路径是否正确`;
  } catch {
    configContent.value = `# 读取配置文件失败\n# 路径: ${configFilePath.value}`;
  } finally {
    configLoading.value = false;
  }
}

async function saveConfigModal() {
  if (configFilePath.value) {
    const ok = await (window as any).electronAPI.writeEnvConfig(
      configFilePath.value,
      configContent.value,
    );
    if (ok) {
      message.success("配置文件保存成功");
      addServiceLog(`配置文件已保存: ${configFilePath.value}`, "success");
    } else {
      message.error("配置文件保存失败");
      addServiceLog(`配置文件保存失败: ${configFilePath.value}`, "error");
    }
  }
  configModalVisible.value = false;
}

function openCmdModal(service: EnvService) {
  cmdModalTitle.value = `编辑启动命令 - ${service.name}`;
  cmdContent.value = service.startCommand;
  cmdEditingService = service;
  cmdModalVisible.value = true;
}

function saveCmdModal() {
  if (cmdEditingService) {
    cmdEditingService.startCommand = cmdContent.value;
    saveServices();
    message.success("启动命令已更新");
    addServiceLog(
      `[${cmdEditingService.name}] 启动命令已设置为: ${cmdContent.value}`,
      "info",
    );
  }
  cmdModalVisible.value = false;
  cmdEditingService = null;
}

async function handleAddService() {
  try {
    const dirPath = await (window as any).electronAPI.selectDirectory();
    if (!dirPath) return;

    addServiceLog(`Analyzing directory: ${dirPath}...`, "info");
    const details = await (window as any).electronAPI.analyzeEnvDir(dirPath);

    if (details && details.type !== "unknown") {
      const isDuplicate = services.value.some((s) => s.dirPath === dirPath);
      if (isDuplicate) {
        message.warning("This service has already been added.");
        return;
      }

      const newService: EnvService = {
        id: Math.random().toString(36).substring(7),
        type: details.type,
        name:
          details.type.charAt(0).toUpperCase() +
          details.type.slice(1) +
          " Server",
        port: details.port,
        dirPath,
        startCommand: details.startCommand || "",
        configFilePath: details.configFilePath || "",
        isRunning: false,
        statusText: "Stopped",
      };

      services.value.push(newService);
      saveServices();
      addServiceLog(
        `Successfully identified and added ${newService.name}.`,
        "success",
      );
      message.success(`Added ${newService.name}`);
    } else {
      addServiceLog(
        `Failed to identify a known service in: ${dirPath}`,
        "error",
      );
      message.error("Unrecognized environment service directory.");
    }
  } catch (error: any) {
    message.error("Error adding service");
    addServiceLog(`Error: ${error.message || String(error)}`, "error");
  }
}
</script>

<template>
  <div class="env-view">
    <div class="services-header">
      <h1 class="section-title">Local Environment Services</h1>
    </div>

    <!-- Grid Container for Services -->
    <div class="services-container">
      <!-- Dynamic Service Cards -->
      <div v-for="service in services" :key="service.id" class="service-card">
        <div class="card-top">
          <div class="card-info">
            <div class="icon-bg" :class="`${service.type}-bg`">
              <Server
                v-if="service.type === 'nacos'"
                :size="24"
                class="nacos-icon"
              />
              <!-- Using standard networking/database icons for others -->
              <svg
                v-else-if="service.type === 'redis'"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-database redis-icon"
              >
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M3 5V19A9 3 0 0 0 21 19V5" />
                <path d="M3 12A9 3 0 0 0 21 12" />
              </svg>
              <Network v-else :size="24" class="accent-icon" />
            </div>
            <div class="card-title-group">
              <div class="card-title">{{ service.name }}</div>
              <div class="card-status">
                <div
                  class="status-dot"
                  :class="
                    service.isRunning
                      ? 'running'
                      : service.statusText === 'Starting...'
                        ? 'starting'
                        : 'stopped'
                  "
                ></div>
                <span>{{ service.statusText }}</span>
              </div>
            </div>
          </div>
          <div class="card-actions">
            <button
              class="icon-btn-outline"
              @click="openCmdModal(service)"
              title="编辑启动命令"
            >
              <Terminal :size="14" />
            </button>
            <button
              class="icon-btn-outline"
              @click="openConfigModal(service)"
              title="编辑配置文件"
            >
              <Settings2 :size="14" />
            </button>
          </div>
        </div>

        <div class="card-meta">
          <div class="meta-item">
            <Network :size="14" />
            <span
              >Port: <strong>{{ service.port }}</strong></span
            >
          </div>
          <div class="meta-item">
            <FolderSearch :size="14" class="accent-icon" />
            <span class="directory-link" :title="service.dirPath">{{
              service.dirPath
            }}</span>
          </div>
        </div>

        <div class="card-footer">
          <Button
            class="action-btn"
            :type="service.isRunning ? 'default' : 'primary'"
            :loading="service.statusText === 'Starting...'"
            @click="toggleService(service)"
          >
            <template #icon v-if="service.statusText !== 'Starting...'">
              <Square v-if="service.isRunning" :size="16" />
              <Play v-else :size="16" />
            </template>
            {{ service.isRunning ? "Stop Service" : "Start Service" }}
          </Button>
        </div>
      </div>

      <!-- Add Service Card -->
      <div class="service-card add-service-card" @click="handleAddService">
        <div class="add-content">
          <div class="add-icon-wrapper">
            <Plus :size="32" class="add-icon" />
          </div>
          <div class="add-text">Add Environment Service</div>
          <div class="add-subtext">
            Select a folder to auto-detect service (e.g. Nacos, Redis)
          </div>
        </div>
      </div>
    </div>

    <!-- Service Logs Panel -->
    <div class="log-panel">
      <div class="log-header">
        <span>Service Logs</span>
        <div class="log-actions">
          <div
            class="icon-action-btn"
            @click="clearServiceLogs"
            title="Clear Logs"
          >
            <Trash2 :size="14" />
          </div>
        </div>
      </div>
      <div class="log-content" ref="logContentRef">
        <div v-for="(log, idx) in serviceLogs" :key="idx" class="log-entry">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-text" :class="log.type">{{ log.message }}</span>
        </div>
      </div>
    </div>

    <!-- Configuration Modal -->
    <Modal
      v-model:visible="configModalVisible"
      :title="configModalTitle"
      @ok="saveConfigModal"
      okText="保存配置"
      cancelText="取消"
      width="680px"
    >
      <div class="modal-path-hint">
        <span class="path-label">文件路径：</span>
        <code class="path-value">{{ configFilePath }}</code>
      </div>
      <textarea
        class="config-textarea"
        v-model="configContent"
        :disabled="configLoading"
      ></textarea>
      <div class="modal-subhint">保存后将直接写入文件系统。</div>
    </Modal>

    <!-- Start Command Modal -->
    <Modal
      v-model:visible="cmdModalVisible"
      :title="cmdModalTitle"
      @ok="saveCmdModal"
      okText="保存命令"
      cancelText="取消"
      width="560px"
    >
      <div class="modal-hint">启动命令</div>
      <div class="modal-subhint" style="margin-top: 0; margin-bottom: 12px">
        请输入完整的启动命令，例如：<code>startup.cmd -m standalone</code>
      </div>
      <input
        class="cmd-input"
        v-model="cmdContent"
        placeholder="如 startup.cmd -m standalone"
      />
    </Modal>
  </div>
</template>

<style scoped>
.env-view {
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow: hidden;
  box-sizing: border-box;
}

.services-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.services-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  flex-shrink: 0;
}

.service-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    border-color 0.2s;
}

.service-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: var(--text-secondary);
}

.card-top {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.card-info {
  display: flex;
  gap: 14px;
}

.icon-bg {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nacos-bg {
  background: rgba(24, 144, 255, 0.1);
}
.nacos-icon {
  color: #1890ff;
}

.redis-bg {
  background: rgba(245, 34, 45, 0.1);
}
.redis-icon {
  color: #f5222d;
}

.nginx-bg {
  background: rgba(82, 196, 26, 0.1);
}
.nginx-icon {
  color: #52c41a;
}

.card-title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-title {
  font-weight: 600;
  font-size: 16px;
  color: var(--text-primary);
  line-height: 1;
}

.card-status {
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--text-secondary);
  transition: background-color 0.3s;
  box-shadow: 0 0 0 2px var(--bg-secondary);
}
.status-dot.running {
  background-color: #52c41a;
}
.status-dot.starting {
  background-color: #faad14;
}

.icon-btn-outline {
  padding: 6px;
  border-radius: 8px;
  height: 32px;
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}
.icon-btn-outline:hover {
  background-color: var(--bg-tertiary);
}

.card-meta {
  padding: 0 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.meta-item strong {
  color: var(--text-primary);
  font-weight: 500;
}

.directory-link {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.accent-icon {
  color: var(--accent-color);
}
.select-dir {
  color: var(--accent-color);
  cursor: pointer;
  border-bottom: 1px dashed var(--accent-color);
}

.card-footer {
  padding: 16px 20px;
  background-color: var(--bg-tertiary);
  border-top: 1px solid var(--border-color);
  display: flex;
  margin-top: auto;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  font-weight: 600;
}

.log-panel {
  flex: 1;
  background-color: var(--bg-secondary);
  border-radius: 10px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  margin-top: 8px;
}

.log-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon-action-btn {
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
}
.icon-action-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.log-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-entry {
  display: flex;
  gap: 12px;
}
.log-time {
  color: var(--text-secondary);
  flex-shrink: 0;
}
.log-text {
  color: var(--text-primary);
  word-break: break-all;
}
.log-text.info {
  color: var(--text-secondary);
}
.log-text.success {
  color: #52c41a;
}
.log-text.error {
  color: #ff4d4f;
}
.log-text.warning {
  color: #faad14;
}

.add-service-card {
  border: 1px dashed var(--border-color);
  background-color: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  transition: all 0.3s ease;
}

.add-service-card:hover {
  border-color: var(--accent-color);
  background-color: var(--bg-secondary);
}

.add-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px;
  text-align: center;
}

.add-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.add-icon {
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.add-service-card:hover .add-icon-wrapper {
  background-color: rgba(24, 144, 255, 0.1);
}

.add-service-card:hover .add-icon {
  color: var(--accent-color);
}

.add-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.add-subtext {
  font-size: 13px;
  color: var(--text-secondary);
  max-width: 200px;
  line-height: 1.4;
}

.modal-hint {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
}

.modal-path-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background-color: var(--bg-tertiary);
  border-radius: 6px;
  font-size: 12px;
}
.path-label {
  color: var(--text-secondary);
  flex-shrink: 0;
}
.path-value {
  color: var(--accent-color);
  word-break: break-all;
  font-family: monospace;
}

.config-textarea {
  width: 100%;
  height: 300px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  resize: none;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 12px;
  line-height: 1.6;
}
.config-textarea:disabled {
  opacity: 0.6;
  cursor: wait;
}

.cmd-input {
  width: 100%;
  height: 40px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0 12px;
  box-sizing: border-box;
}
.cmd-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.modal-subhint {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 8px;
}
.modal-subhint code {
  background-color: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
}
</style>
