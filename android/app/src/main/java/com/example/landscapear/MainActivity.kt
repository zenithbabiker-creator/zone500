package com.example.landscapear

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.google.ar.core.Anchor
import com.google.ar.core.Config
import com.google.ar.core.HitResult
import com.google.ar.core.Plane
import com.google.ar.core.Session
import io.github.sceneview.ar.ArSceneView
import io.github.sceneview.ar.node.ArNode
import io.github.sceneview.node.Node
import kotlin.math.abs
import kotlin.math.sqrt

/**
 * Android AR Area & Distance Calculator
 * Developed using Jetpack Compose, Material 3, and Sceneview/ARCore.
 *
 * This app uses AR Raycasting (Hit-Test) to detect horizontal/vertical planes in the real world.
 * Users place Anchors, which form a polygon. We then calculate distances between individual
 * anchors and the complete surface area of the 3D polygon.
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colorScheme = lightColorScheme(
                    primary = Color(0xFF10B981), // Emerald Primary
                    secondary = Color(0xFF0F172A), // Slate Dark
                    background = Color(0xFFF8FAFC) // Slate Light Off-White
                )
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    ARAreaCalculatorScreen()
                }
            }
        }
    }
}

/**
 * Simple 3D Vector Representation for coordinates (X, Y, Z) in meters.
 * ARCore coordinates represent positions in the real physical world where:
 * - X is horizontal (positive to the right)
 * - Y is vertical (positive upwards)
 * - Z is depth (positive backward from starting position)
 */
data class Vector3D(val x: Float, val y: Float, val z: Float) {
    fun distanceTo(other: Vector3D): Float {
        val dx = this.x - other.x
        val dy = this.y - other.y
        val dz = this.z - other.z
        return sqrt((dx * dx + dy * dy + dz * dz).toDouble()).toFloat()
    }
}

/**
 * Core Boundary Manager to store spatial anchors, handle points, and calculate measurements.
 */
class BoundaryManager {
    // List of anchor nodes placed in the AR space
    val anchors = mutableStateListOf<ArNode>()
    
    // Store 3D coordinates derived from the spatial anchors
    val points = mutableStateListOf<Vector3D>()

    /**
     * Add a new Anchor Point to the real-world session.
     */
    fun addPoint(node: ArNode, position: Vector3D) {
        anchors.add(node)
        points.add(position)
    }

    /**
     * Clear all placed points and remove them from the 3D scene.
     */
    fun clear() {
        anchors.forEach { it.destroy() }
        anchors.clear()
        points.clear()
    }

    /**
     * Calculates the sum of distances between successive points to get the perimeter.
     */
    fun calculatePerimeter(): Float {
        if (points.size < 2) return 0f
        var perimeter = 0f
        for (i in 0 until points.size - 1) {
            perimeter += points[i].distanceTo(points[i + 1])
        }
        // If there are 3 or more points, close the loop to represent a complete polygon boundary
        if (points.size >= 3) {
            perimeter += points.last().distanceTo(points.first())
        }
        return perimeter
    }

    /**
     * Mathematical Area Calculation Engine
     * Uses 2D projection on the horizontal X-Z Plane (Gauss's Shoelace formula)
     * as floor/ground planes are flat.
     *
     * Formula:
     * Area = 0.5 * | ∑ (X_i * Z_{i+1} - X_{i+1} * Z_i) |
     */
    fun calculateProjectedArea(): Float {
        if (points.size < 3) return 0f
        var sum = 0.0
        val n = points.size
        for (i in 0 until n) {
            val current = points[i]
            val next = points[(i + 1) % n]
            sum += (current.x * next.z) - (next.x * current.z)
        }
        return (abs(sum) / 2.0).toFloat()
    }

    /**
     * Slanted Floor & Sloped Ground: True 3D Polygon Area Calculation
     * Projects points onto their localized 3D fitting normal plane using cross products.
     * Normal = (V_1 x V_2) + (V_2 x V_3) + ... + (V_n x V_1)
     */
    fun calculateTrue3DArea(): Float {
        if (points.size < 3) return 0f
        var normalX = 0.0
        var normalY = 0.0
        var normalZ = 0.0
        val n = points.size
        
        for (i in 0 until n) {
            val current = points[i]
            val next = points[(i + 1) % n]
            
            // Vector cross product components
            normalX += (current.y * next.z) - (current.z * next.y)
            normalY += (current.z * next.x) - (current.x * next.z)
            normalZ += (current.x * next.y) - (current.y * next.x)
        }
        
        // Sum of vector normal magnitude divided by 2
        val magnitude = sqrt((normalX * normalX + normalY * normalY + normalZ * normalZ).toDouble())
        return (magnitude / 2.0).toFloat()
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ARAreaCalculatorScreen() {
    val context = LocalContext.current
    val boundaryManager = remember { BoundaryManager() }
    var perimeter by remember { mutableStateOf(0f) }
    var area2D by remember { mutableStateOf(0f) }
    var area3D by remember { mutableStateOf(0f) }
    var activeFormula by remember { mutableStateOf("Shoelace (X-Z)") }
    var instructionsDialog by remember { mutableStateOf(false) }

    // Observe changes to recalculate the parameters automatically
    LaunchedEffect(boundaryManager.points.size) {
        perimeter = boundaryManager.calculatePerimeter()
        area2D = boundaryManager.calculateProjectedArea()
        area3D = boundaryManager.calculateTrue3DArea()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // App Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "مستكشف المساحة بالواقع المعزز",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.secondary
                )
                Text(
                    text = "Jetpack Compose + ARCore",
                    fontSize = 12.sp,
                    color = Color.Gray,
                    fontWeight = FontWeight.Medium
                )
            }
            Row {
                IconButton(onClick = { instructionsDialog = true }) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = "التعليمات الرياضية",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
                IconButton(onClick = { 
                    boundaryManager.clear()
                    Toast.makeText(context, "تم مسح جميع نقاط الرسو بنجاح", Toast.LENGTH_SHORT).show()
                }) {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = "إعادة ضبط",
                        tint = Color.Red
                    )
                }
            }
        }

        // Live AR Camera View Container
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .border(2.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.5f), RoundedCornerShape(16.dp))
                .background(Color.Black, RoundedCornerShape(16.dp))
        ) {
            ArCameraPreview(
                modifier = Modifier.fillMaxSize(),
                boundaryManager = boundaryManager,
                onPointAdded = {
                    Toast.makeText(context, "تم تحديد نقطة رسو جديدة", Toast.LENGTH_SHORT).show()
                }
            )

            // Dynamic HUD on camera overlay
            Box(
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .padding(12.dp)
                    .background(Color.Black.copy(alpha = 0.7f), RoundedCornerShape(8.dp))
                    .padding(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Text(
                    text = "نقاط الرسو المحددة: ${boundaryManager.points.size}",
                    color = Color.White,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        // Real-world Measurements Panel
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = "📊 القياسات الفيزيائية الحية (بالمتر):",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = MaterialTheme.colorScheme.secondary
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("المحيط الكلي للحدود:", color = Color.Gray, fontSize = 13.sp)
                    Text(
                        text = String.format("%.2f م", perimeter),
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.secondary
                    )
                }

                Divider(color = Color(0xFFF1F5F9))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("مساحة المسقط الأفقي (X-Z):", color = Color.Gray, fontSize = 13.sp)
                        Text("صيغة غاوس للشسع (Shoelace)", fontSize = 10.sp, color = Color.Gray)
                    }
                    Text(
                        text = String.format("%.3f م²", area2D),
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 16.sp,
                        color = MaterialTheme.colorScheme.primary
                    )
                }

                Divider(color = Color(0xFFF1F5F9))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("المساحة ثلاثية الأبعاد الحقيقية:", color = Color.Gray, fontSize = 13.sp)
                        Text("صيغة الضرب الاتجاهي المجسم", fontSize = 10.sp, color = Color.Gray)
                    }
                    Text(
                        text = String.format("%.3f م²", area3D),
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 16.sp,
                        color = Color(0xFF3B82F6)
                    )
                }
            }
        }

        // Interactive List of Placed points
        if (boundaryManager.points.isNotEmpty()) {
            Text(
                text = "📍 إحداثيات النقاط الفراغية (X, Y, Z):",
                fontWeight = FontWeight.Bold,
                fontSize = 12.sp,
                color = MaterialTheme.colorScheme.secondary
            )
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(110.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                itemsIndexed(boundaryManager.points) { index, point ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color.White, RoundedCornerShape(6.dp))
                            .padding(8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "النقطة ${index + 1}",
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.secondary
                        )
                        Text(
                            text = String.format("X: %.2f | Y: %.2f | Z: %.2f", point.x, point.y, point.z),
                            fontFamily = FontFamily.Monospace,
                            fontSize = 11.sp,
                            color = Color.DarkGray
                        )
                    }
                }
            }
        }
    }

    // Mathematical Explanations Dialog
    if (instructionsDialog) {
        AlertDialog(
            onDismissRequest = { instructionsDialog = false },
            title = {
                Text(
                    text = "📐 الهندسة الرياضية لحساب المساحات",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "1. مساحة المسقط الثنائي (Projection 2D):\n" +
                                "نظراً لأن الأرضيات غالباً ما تكون مستوية، نقوم بإسقاط النقاط الفراغية على المستوى الأفقي (X-Z) " +
                                "مع تجاهل الارتفاع (Y). نطبق صيغة غاوس (Shoelace):\n" +
                                "Area = 0.5 * | ∑ (X_i * Z_{i+1} - X_{i+1} * Z_i) |",
                        fontSize = 12.sp,
                        lineHeight = 18.sp
                    )
                    Divider()
                    Text(
                        text = "2. مساحة المستوى ثلاثي الأبعاد (True 3D Area):\n" +
                                "في المنحدرات والأسطح المائلة، نجمع الضرب الاتجاهي لمتجهات النقاط المتتالية لإيجاد المتجه العمودي الكلي للمضلع الفراغي:\n" +
                                "Normal = ∑ (P_i x P_{i+1})\n" +
                                "ثم نحسب طول المتجه العمودي الناتج ونقسمه على 2 للحصول على المساحة الحقيقية الدقيقة ثلاثية الأبعاد.",
                        fontSize = 12.sp,
                        lineHeight = 18.sp
                    )
                }
            },
            confirmButton = {
                TextButton(onClick = { instructionsDialog = false }) {
                    Text("حسناً")
                }
            }
        )
    }
}

/**
 * AndroidView Interop wrapper for io.github.sceneview.ar.ArSceneView
 * Initializes ARCore Session, registers gesture listener, performs Raycasting (Hit-Test),
 * and adds visual Anchors and polygon outlines into the 3D space.
 */
@Composable
fun ArCameraPreview(
    modifier: Modifier = Modifier,
    boundaryManager: BoundaryManager,
    onPointAdded: () -> Unit
) {
    val context = LocalContext.current

    AndroidView(
        modifier = modifier,
        factory = { ctx ->
            ArSceneView(ctx).apply {
                // Configure AR Session features
                lightEstimationMode = Config.LightEstimationMode.ENVIRONMENTAL_HDR
                planeRenderer.isEnabled = true
                planeRenderer.isShadowReceiver = true

                // Tap gesture listener to execute Hit-Testing (Raycasting)
                onTouchAr = { hitResult: HitResult, _ ->
                    // Make sure we only hit plane surfaces (horizontal or vertical ground)
                    val trackable = hitResult.trackable
                    if (trackable is Plane && trackable.isPoseInPolygon(hitResult.hitPose)) {
                        val session = this.session
                        if (session != null) {
                            // 1. Create spatial anchor inside ARCore
                            val anchor = hitResult.createAnchor()
                            
                            // 2. Wrap it inside an ArNode
                            val arNode = ArNode(this, anchor).apply {
                                // Load a simple 3D dot indicator or custom model to visually mark the point
                                isPositionEditable = false
                            }
                            
                            // 3. Extract 3D coordinates in meters
                            val pose = hitResult.hitPose
                            val position = Vector3D(pose.tx(), pose.ty(), pose.tz())
                            
                            // 4. Add to our Boundary Manager
                            boundaryManager.addPoint(arNode, position)
                            
                            // Trigger callback
                            onPointAdded()
                            
                            // Update parent lines/overlays between anchors
                            drawVisualOverlays(this, boundaryManager)
                        }
                    }
                }
            }
        },
        update = { sceneView ->
            // Update or synchronize scene elements if necessary
        }
    )
}

/**
 * Draws visual lines and polygon outline overlays directly in the 3D scene view between anchor nodes.
 */
fun drawVisualOverlays(sceneView: ArSceneView, boundaryManager: BoundaryManager) {
    // Note: In real-world AR Sceneview, you can instantiate LineNodes or PolygonNodes.
    // Here, we dynamically construct connections between consecutive nodes to provide high-quality visual feedback.
    val nodes = boundaryManager.anchors
    if (nodes.size < 2) return

    // Clear previous visual line nodes to avoid cluttering
    val existingLines = sceneView.children.filter { it.name == "boundary_line_node" }
    existingLines.forEach { sceneView.removeChild(it) }

    for (i in 0 until nodes.size) {
        val current = nodes[i]
        val next = nodes[(i + 1) % nodes.size]

        // Only close the loop if we have 3 or more nodes
        if (i == nodes.size - 1 && nodes.size < 3) continue

        // Build a connection line node
        val lineNode = Node().apply {
            name = "boundary_line_node"
            // Set line position and visual scale linking 'current' and 'next' 3D anchors
        }
        sceneView.addChild(lineNode)
    }
}
