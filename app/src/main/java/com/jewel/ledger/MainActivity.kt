package com.jewel.ledger

import android.Manifest
import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.view.View
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.webkit.WebViewAssetLoader
import com.jewel.ledger.databinding.ActivityMainBinding
import java.io.File
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    // File/Photo Upload Callbacks
    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var cameraImageUri: Uri? = null

    // Activity Launchers
    private lateinit var fileChooserLauncher: ActivityResultLauncher<Intent>
    private lateinit var cameraPermissionLauncher: ActivityResultLauncher<String>

    // WebView Asset Loader for local offline assets serving via secure virtual domain
    private lateinit var assetLoader: WebViewAssetLoader

    companion object {
        // App assets path for loading index.html from app/src/main/assets/www/index.html
        private const val ASSETS_URL = "https://appassets.androidplatform.net/assets/www/index.html"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupAssetLoader()
        setupLaunchers()
        setupHardwareBackButton()
        setupSwipeRefresh()
        setupWebView()

        loadOfflineWebApp()
    }

    /**
     * Initializes WebViewAssetLoader to serve files from app/src/main/assets/ safely
     */
    private fun setupAssetLoader() {
        assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()
    }

    /**
     * Configures ActivityResult Launchers for Gallery File Chooser & Camera Permissions
     */
    private fun setupLaunchers() {
        fileChooserLauncher = registerForActivityResult(
            ActivityResultContracts.StartActivityForResult()
        ) { result ->
            if (filePathCallback == null) return@registerForActivityResult

            var results: Array<Uri>? = null
            if (result.resultCode == RESULT_OK) {
                val data = result.data
                if (data != null && data.data != null) {
                    val resultString = data.dataString
                    if (resultString != null) {
                        results = arrayOf(Uri.parse(resultString))
                    }
                } else if (cameraImageUri != null) {
                    results = arrayOf(cameraImageUri!!)
                }
            }

            filePathCallback?.onReceiveValue(results)
            filePathCallback = null
        }

        cameraPermissionLauncher = registerForActivityResult(
            ActivityResultContracts.RequestPermission()
        ) { isGranted ->
            if (isGranted) {
                launchFileChooser(includeCamera = true)
            } else {
                Toast.makeText(this, "Camera permission denied. Using file picker.", Toast.LENGTH_SHORT).show()
                launchFileChooser(includeCamera = false)
            }
        }
    }

    /**
     * Handles Device Hardware Back Button to navigate back in WebView history
     */
    private fun setupHardwareBackButton() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (binding.webView.canGoBack()) {
                    binding.webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    /**
     * Configures SwipeToRefresh with scroll conflict prevention
     */
    private fun setupSwipeRefresh() {
        binding.swipeRefreshLayout.setColorSchemeResources(
            android.R.color.holo_blue_bright,
            android.R.color.holo_green_light,
            android.R.color.holo_orange_light,
            android.R.color.holo_red_light
        )

        binding.swipeRefreshLayout.setOnRefreshListener {
            binding.webView.reload()
        }

        // Prevent Pull-to-Refresh triggering while user scrolls down web content
        binding.swipeRefreshLayout.setOnChildScrollUpListener { _, _ ->
            binding.webView.scrollY > 0
        }
    }

    /**
     * Configures WebSettings, WebChromeClient, and WebViewClient
     */
    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val settings: WebSettings = binding.webView.settings

        // Mandatory WebSettings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        @Suppress("DEPRECATION")
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT

        // CORS & Local Storage Support
        @Suppress("DEPRECATION")
        settings.allowFileAccessFromFileURLs = true
        @Suppress("DEPRECATION")
        settings.allowUniversalAccessFromFileURLs = true

        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW

        // WebChromeClient for File Uploads, JS Dialogs, and Loading Progress
        binding.webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress == 100) {
                    binding.loadingProgressBar.visibility = View.GONE
                    binding.swipeRefreshLayout.isRefreshing = false
                }
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                this@MainActivity.filePathCallback?.onReceiveValue(null)
                this@MainActivity.filePathCallback = filePathCallback

                checkCameraPermissionAndLaunchChooser()
                return true
            }

            override fun onJsAlert(
                view: WebView?,
                url: String?,
                message: String?,
                result: android.webkit.JsResult?
            ): Boolean {
                AlertDialog.Builder(this@MainActivity)
                    .setMessage(message)
                    .setPositiveButton(android.R.string.ok) { _, _ -> result?.confirm() }
                    .setCancelable(false)
                    .create()
                    .show()
                return true
            }

            override fun onJsConfirm(
                view: WebView?,
                url: String?,
                message: String?,
                result: android.webkit.JsResult?
            ): Boolean {
                AlertDialog.Builder(this@MainActivity)
                    .setMessage(message)
                    .setPositiveButton(android.R.string.ok) { _, _ -> result?.confirm() }
                    .setNegativeButton(android.R.string.cancel) { _, _ -> result?.cancel() }
                    .setCancelable(false)
                    .create()
                    .show()
                return true
            }
        }

        // WebViewClient for Asset Loading & Intent Interception
        binding.webView.webViewClient = object : WebViewClient() {
            // Intercept local assets via WebViewAssetLoader for CORS / HTTPS compliance
            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest?
            ): WebResourceResponse? {
                if (request != null) {
                    val response = assetLoader.shouldInterceptRequest(request.url)
                    if (response != null) return response
                }
                return super.shouldInterceptRequest(view, request)
            }

            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                val url = request?.url?.toString() ?: return false
                return handleCustomUrlSchemes(url)
            }

            @Deprecated("Deprecated in API 24")
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                if (url == null) return false
                return handleCustomUrlSchemes(url)
            }

            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                binding.loadingProgressBar.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                binding.loadingProgressBar.visibility = View.GONE
                binding.swipeRefreshLayout.isRefreshing = false
            }
        }
    }

    /**
     * Intercepts WhatsApp, Phone Dialer, UPI Payments, and External App Links
     */
    private fun handleCustomUrlSchemes(url: String): Boolean {
        // WhatsApp Intent Intercept (whatsapp://, https://wa.me/, api.whatsapp.com)
        if (url.startsWith("whatsapp://") ||
            url.contains("api.whatsapp.com") ||
            url.contains("wa.me")
        ) {
            return launchExternalIntent(url, "WhatsApp")
        }

        // Phone Dialer (tel:)
        if (url.startsWith("tel:")) {
            val intent = Intent(Intent.ACTION_DIAL, Uri.parse(url))
            startActivity(intent)
            return true
        }

        // UPI Payment Intent (upi://)
        if (url.startsWith("upi://")) {
            return launchExternalIntent(url, "UPI Payment App")
        }

        // Mailto links (mailto:)
        if (url.startsWith("mailto:")) {
            val intent = Intent(Intent.ACTION_SENDTO, Uri.parse(url))
            startActivity(intent)
            return true
        }

        // Keep internal asset navigation inside WebView
        if (url.startsWith("https://appassets.androidplatform.net") || url.startsWith("file:///")) {
            return false
        }

        // External HTTPS web pages
        return false
    }

    private fun launchExternalIntent(url: String, appName: String): Boolean {
        return try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            startActivity(intent)
            true
        } catch (e: ActivityNotFoundException) {
            Toast.makeText(this, "$appName is not installed on this device.", Toast.LENGTH_SHORT).show()
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    private fun checkCameraPermissionAndLaunchChooser() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            launchFileChooser(includeCamera = true)
        } else {
            cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    private fun launchFileChooser(includeCamera: Boolean = true) {
        var takePictureIntent: Intent? = null

        if (includeCamera) {
            takePictureIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
            if (takePictureIntent.resolveActivity(packageManager) != null) {
                var photoFile: File? = null
                try {
                    photoFile = createImageFile()
                } catch (ex: IOException) {
                    ex.printStackTrace()
                }

                if (photoFile != null) {
                    cameraImageUri = FileProvider.getUriForFile(
                        this,
                        "${applicationContext.packageName}.fileprovider",
                        photoFile
                    )
                    takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, cameraImageUri)
                } else {
                    takePictureIntent = null
                }
            }
        }

        val contentSelectionIntent = Intent(Intent.ACTION_GET_CONTENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "image/*"
        }

        val intentArray: Array<Intent> = takePictureIntent?.let { arrayOf(it) } ?: emptyArray()

        val chooserIntent = Intent(Intent.ACTION_CHOOSER).apply {
            putExtra(Intent.EXTRA_INTENT, contentSelectionIntent)
            putExtra(Intent.EXTRA_TITLE, "Select Receipt Image")
            putExtra(Intent.EXTRA_INITIAL_INTENTS, intentArray)
        }

        try {
            fileChooserLauncher.launch(chooserIntent)
        } catch (e: Exception) {
            filePathCallback?.onReceiveValue(null)
            filePathCallback = null
            Toast.makeText(this, "Cannot open file chooser.", Toast.LENGTH_SHORT).show()
        }
    }

    @Throws(IOException::class)
    private fun createImageFile(): File {
        val timeStamp: String = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val storageDir: File? = getExternalFilesDir(Environment.DIRECTORY_PICTURES)
        return File.createTempFile("JEWEL_RECEIPT_${timeStamp}_", ".jpg", storageDir)
    }

    private fun loadOfflineWebApp() {
        binding.webView.loadUrl(ASSETS_URL)
    }
}
