<template>
<el-row :gutter="20" style="margin-top: 20px;">
  <el-col :span="3" :offset="2" style="text-align: center">
    <el-upload action="http://localhost" :auto-upload="false" :on-change="onFileChange" :on-remove="onFileRemove">
      <el-button type="success">Upload Gene List</el-button>
      <transition name="fade">
        <div v-if="!fileUploaded" style="margin-top:20px" >No File Uploaded</div>
      </transition>
    </el-upload>
  </el-col>
  <el-col :span="3" :offset="1" style="text-align: center">
    <el-form>
      <el-form-item label="Select File Type">
        <el-select v-model="fileType">
          <el-option label="Temp" value="temp"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </el-col>
  <el-col :span="3" :offset="1" style="text-align: center">
    <el-form>
      <el-form-item label="Select Identifier">
        <el-select v-model="fileType">
          <el-option label="Temp" value="temp"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </el-col>
</el-row>
</template>

<script>
export default {
  name: 'GeneFileUploader',
  data () {
    return {
      fileUploaded: false,
      fileType: ''
    }
  },
  methods: {
    onFileChange (file, fileList) {
      if (fileList.length > 1) {
        fileList.shift()
      }
      this.fileUploaded = true;
      console.log(file)
    },
    onFileRemove (file, fileList) {
      this.fileUploaded = false;
    }
  }
}
</script>