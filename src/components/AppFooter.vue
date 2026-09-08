<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { NCard, NModal, NIcon, NButton } from 'naive-ui';
import { IconShieldCheck, IconMail, IconBrandGithub, IconExternalLink } from '@tabler/icons-vue';

const showPrivacyModal = ref(false);
const showContactModal = ref(false);
</script>

<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <!-- 第一行：版权信息 -->
      <div class="copyright">
        © 2025 <a href="https://tools.afeiii.com" target="_blank" rel="noopener noreferrer" class="site-link">tools.afeiii.com</a> All Rights Reserved.
      </div>

      <!-- 第二行：合规与导航链接 -->
      <div class="links">
        <button class="footer-link" @click="showPrivacyModal = true">
          隐私政策
        </button>
        <span class="divider">|</span>
        <RouterLink to="/about" class="footer-link">
          关于本站
        </RouterLink>
        <span class="divider">|</span>
        <RouterLink to="/support" class="footer-link">
          支持本站
        </RouterLink>
        <span class="divider">|</span>
        <button class="footer-link" @click="showContactModal = true">
          联系站长
        </button>
      </div>
    </div>

    <!-- 隐私政策弹窗 -->
    <n-modal v-model:show="showPrivacyModal" preset="card" title="隐私政策与安全承诺" style="max-width: 560px;" class="privacy-modal">
      <div class="modal-content">
        <div class="modal-item">
          <div class="item-title">
            <n-icon :component="IconShieldCheck" class="text-primary mr-1" />
            纯本地计算保障
          </div>
          <p class="item-desc">
            十三月工具箱（tools.afeiii.com）高度重视您的隐私安全。除极少数需请求公网公开 API 的功能外，本站所有加解密、数据转换、文本格式化及运算逻辑均在您的<strong>本地浏览器纯前端运行</strong>。
          </p>
        </div>

        <div class="modal-item">
          <div class="item-title">
            零数据上传与留存
          </div>
          <p class="item-desc">
            我们不会收集、储存或上传您在工具中输入的任何敏感信息、业务代码、证书密码或文本内容。您的个人输入数据只留存在您的当前设备中。
          </p>
        </div>

        <div class="modal-item">
          <div class="item-title">
            开源透明与可审计
          </div>
          <p class="item-desc">
            本站基于开源技术构建，代码对公众开放审查。您可以随时检查浏览器的网络请求（Network）确认没有私自上传行为。
          </p>
        </div>
      </div>
      <template #footer>
        <div flex justify-end>
          <n-button type="primary" @click="showPrivacyModal = false">
            我知道了
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- 联系站长弹窗 -->
    <n-modal v-model:show="showContactModal" preset="card" title="联系站长" style="max-width: 500px;" class="contact-modal">
      <div class="modal-content">
        <p class="text-sm text-neutral-400 mb-4">
          如果您在工具使用过程中遇到 Bug、有新的功能工具诉求或商务交流合作，欢迎随时通过以下方式联系：
        </p>

        <div class="contact-card">
          <div class="contact-icon">
            <n-icon size="20" :component="IconMail" />
          </div>
          <div class="contact-info">
            <div class="contact-label">官方反馈邮箱</div>
            <a href="mailto:support@afeiii.com" class="contact-value">support@afeiii.com</a>
          </div>
        </div>

        <div class="contact-card mt-3">
          <div class="contact-icon">
            <n-icon size="20" :component="IconBrandGithub" />
          </div>
          <div class="contact-info">
            <div class="contact-label">GitHub 仓库 (本站源码)</div>
            <a href="https://github.com/bigzhihui/it-tools" target="_blank" rel="noopener noreferrer" class="contact-value flex items-center">
              github.com/bigzhihui/it-tools
              <n-icon size="14" :component="IconExternalLink" class="ml-1" />
            </a>
          </div>
        </div>
      </div>
      <template #footer>
        <div flex justify-end>
          <n-button type="primary" @click="showContactModal = false">
            关闭
          </n-button>
        </div>
      </template>
    </n-modal>
  </footer>
</template>

<style scoped lang="less">
.app-footer {
  width: 100%;
  margin-top: 48px;
  padding: 24px 16px 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid rgba(128, 128, 128, 0.12);

  .footer-inner {
    text-align: center;
    font-size: 13px;
    line-height: 1.8;
  }

  .copyright {
    color: rgba(128, 128, 128, 0.85);
    margin-bottom: 6px;

    .site-link {
      color: inherit;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;

      &:hover {
        color: #1ea54c;
      }
    }
  }

  .links {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    color: rgba(128, 128, 128, 0.7);

    .divider {
      opacity: 0.4;
      font-size: 12px;
      user-select: none;
    }

    .footer-link {
      background: none;
      border: none;
      padding: 0;
      color: rgba(128, 128, 128, 0.85);
      font-size: 13px;
      cursor: pointer;
      text-decoration: none;
      transition: color 0.2s ease;

      &:hover {
        color: #1ea54c;
      }
    }
  }
}

.modal-content {
  .modal-item {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .item-title {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
    }

    .item-desc {
      font-size: 13px;
      line-height: 1.6;
      color: rgba(128, 128, 128, 0.9);
      margin: 0;
    }
  }
}

.contact-card {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(128, 128, 128, 0.08);
  border-radius: 8px;
  border: 1px solid rgba(128, 128, 128, 0.12);

  .contact-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(30, 165, 76, 0.12);
    color: #1ea54c;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    flex-shrink: 0;
  }

  .contact-info {
    flex: 1;

    .contact-label {
      font-size: 12px;
      color: rgba(128, 128, 128, 0.75);
    }

    .contact-value {
      font-size: 14px;
      color: inherit;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;

      &:hover {
        color: #1ea54c;
      }
    }
  }
}
</style>
